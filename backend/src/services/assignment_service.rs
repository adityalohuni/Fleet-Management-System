use std::sync::Arc;
use uuid::Uuid;
use async_trait::async_trait;
use crate::error::AppError;
use crate::models::postgres::assignment::{VehicleAssignment, CreateAssignmentDto, AssignmentStatus};
use crate::models::postgres::vehicle::VehicleStatus;
use crate::models::postgres::driver::DriverStatus;
use crate::repositories::postgres::assignment_repo::AssignmentRepositoryTrait;
use crate::repositories::postgres::vehicle_repo::VehicleRepositoryTrait;
use crate::repositories::postgres::driver_repo::DriverRepositoryTrait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait AssignmentServiceTrait: Send + Sync {
    async fn create_assignment(&self, dto: CreateAssignmentDto) -> Result<VehicleAssignment, AppError>;
    async fn complete_assignment(&self, id: Uuid) -> Result<VehicleAssignment, AppError>;
    async fn get_assignment(&self, id: Uuid) -> Result<VehicleAssignment, AppError>;
    async fn list_assignments(&self) -> Result<Vec<VehicleAssignment>, AppError>;
    async fn get_assignments_by_driver(&self, driver_id: Uuid) -> Result<Vec<VehicleAssignment>, AppError>;
}

pub struct AssignmentService {
    assignment_repo: Arc<dyn AssignmentRepositoryTrait>,
    vehicle_repo: Arc<dyn VehicleRepositoryTrait>,
    driver_repo: Arc<dyn DriverRepositoryTrait>,
}

impl AssignmentService {
    pub fn new(
        assignment_repo: Arc<dyn AssignmentRepositoryTrait>,
        vehicle_repo: Arc<dyn VehicleRepositoryTrait>,
        driver_repo: Arc<dyn DriverRepositoryTrait>,
    ) -> Self {
        Self {
            assignment_repo,
            vehicle_repo,
            driver_repo,
        }
    }
}

#[async_trait]
impl AssignmentServiceTrait for AssignmentService {
    async fn create_assignment(&self, dto: CreateAssignmentDto) -> Result<VehicleAssignment, AppError> {
        // 1. Check if vehicle exists and is available
        let vehicle = self.vehicle_repo.find_by_id(dto.vehicle_id).await?
            .ok_or(AppError::NotFound("Vehicle not found".into()))?;
        
        if vehicle.status != VehicleStatus::Available {
            return Err(AppError::BadRequest("Vehicle is not available".into()));
        }

        // 2. Check if driver exists and is available
        let driver = self.driver_repo.find_by_id(dto.driver_id).await?
            .ok_or(AppError::NotFound("Driver not found".into()))?;

        if driver.status != DriverStatus::Available {
            return Err(AppError::BadRequest("Driver is not available".into()));
        }

        // 3. Create assignment
        let assignment = self.assignment_repo.create(dto).await?;

        // 4. Update vehicle status
        self.vehicle_repo.update_status(vehicle.id, VehicleStatus::Assigned).await?;

        // 5. Update driver status
        self.driver_repo.update_status(driver.id, DriverStatus::OnDuty).await?;

        Ok(assignment)
    }

    async fn complete_assignment(&self, id: Uuid) -> Result<VehicleAssignment, AppError> {
        let assignment = self.assignment_repo.find_by_id(id).await?
            .ok_or(AppError::NotFound("Assignment not found".into()))?;

        if assignment.status == AssignmentStatus::Completed {
            return Err(AppError::BadRequest("Assignment is already completed".into()));
        }

        let updated_assignment = self.assignment_repo.update_status(id, AssignmentStatus::Completed).await?;

        // Update vehicle status to Available
        self.vehicle_repo.update_status(assignment.vehicle_id, VehicleStatus::Available).await?;

        // Update driver status to Available
        self.driver_repo.update_status(assignment.driver_id, DriverStatus::Available).await?;

        Ok(updated_assignment)
    }

    async fn get_assignment(&self, id: Uuid) -> Result<VehicleAssignment, AppError> {
        self.assignment_repo.find_by_id(id).await?
            .ok_or(AppError::NotFound("Assignment not found".into()))
    }

    async fn list_assignments(&self) -> Result<Vec<VehicleAssignment>, AppError> {
        self.assignment_repo.find_all().await
    }

    async fn get_assignments_by_driver(&self, driver_id: Uuid) -> Result<Vec<VehicleAssignment>, AppError> {
        self.assignment_repo.find_by_driver_id(driver_id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::postgres::assignment_repo::MockAssignmentRepositoryTrait;
    use crate::repositories::postgres::vehicle_repo::MockVehicleRepositoryTrait;
    use crate::repositories::postgres::driver_repo::MockDriverRepositoryTrait;
    use crate::models::postgres::vehicle::{Vehicle, VehicleType, FuelType};
    use crate::models::postgres::driver::Driver;
    use chrono::Utc;
    use mockall::predicate::*;

    #[tokio::test]
    async fn test_create_assignment_success() {
        let mut mock_assignment_repo = MockAssignmentRepositoryTrait::new();
        let mut mock_vehicle_repo = MockVehicleRepositoryTrait::new();
        let mut mock_driver_repo = MockDriverRepositoryTrait::new();

        let vehicle_id = Uuid::new_v4();
        let driver_id = Uuid::new_v4();
        let assignment_id = Uuid::new_v4();

        let vehicle = Vehicle {
            id: vehicle_id,
            make: "Toyota".into(),
            model: "Corolla".into(),
            year: 2020,
            vin: "VIN123".into(),
            license_plate: "ABC-123".into(),
            r#type: VehicleType::Sedan,
            status: VehicleStatus::Available,
            current_mileage: 10000,
            fuel_type: FuelType::Gasoline,
            specs: Some(serde_json::json!({})),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            deleted_at: None,
        };

        let driver = Driver {
            id: driver_id,
            user_id: Uuid::new_v4(),
            license_number: "LIC123".into(),
            status: DriverStatus::Available,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            deleted_at: None,
        };

        let dto = CreateAssignmentDto {
            vehicle_id,
            driver_id,
            start_time: Utc::now(),
            end_time: None,
            status: AssignmentStatus::Scheduled,
        };

        let assignment = VehicleAssignment {
            id: assignment_id,
            vehicle_id,
            driver_id,
            start_time: dto.start_time,
            end_time: None,
            status: AssignmentStatus::Scheduled,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // Clone for closures
        let vehicle_clone = vehicle.clone();
        let driver_clone = driver.clone();
        let assignment_clone = assignment.clone();

        mock_vehicle_repo
            .expect_find_by_id()
            .with(eq(vehicle_id))
            .times(1)
            .returning(move |_| Ok(Some(vehicle_clone.clone())));

        mock_driver_repo
            .expect_find_by_id()
            .with(eq(driver_id))
            .times(1)
            .returning(move |_| Ok(Some(driver_clone.clone())));

        mock_assignment_repo
            .expect_create()
            .times(1)
            .returning(move |_| Ok(assignment_clone.clone()));

        mock_vehicle_repo
            .expect_update_status()
            .with(eq(vehicle_id), eq(VehicleStatus::Assigned))
            .times(1)
            .returning(move |_, _| Ok(vehicle.clone()));

        mock_driver_repo
            .expect_update_status()
            .with(eq(driver_id), eq(DriverStatus::OnDuty))
            .times(1)
            .returning(move |_, _| Ok(driver.clone()));

        let service = AssignmentService::new(
            Arc::new(mock_assignment_repo),
            Arc::new(mock_vehicle_repo),
            Arc::new(mock_driver_repo),
        );

        let result = service.create_assignment(dto).await;
        assert!(result.is_ok());
    }
}
