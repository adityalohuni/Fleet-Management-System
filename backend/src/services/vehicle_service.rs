use uuid::Uuid;
use crate::models::postgres::vehicle::{Vehicle, CreateVehicleDto, VehicleStatus};
use crate::repositories::postgres::vehicle_repo::VehicleRepositoryTrait;
use crate::error::AppError;

#[cfg_attr(test, mockall::automock)]
#[async_trait::async_trait]
pub trait VehicleServiceTrait: Send + Sync {
    async fn create_vehicle(&self, dto: CreateVehicleDto) -> Result<Vehicle, AppError>;
    async fn get_vehicle(&self, id: Uuid) -> Result<Vehicle, AppError>;
    async fn list_vehicles(&self) -> Result<Vec<Vehicle>, AppError>;
    async fn update_vehicle_status(&self, id: Uuid, status: VehicleStatus) -> Result<Vehicle, AppError>;
    async fn delete_vehicle(&self, id: Uuid) -> Result<(), AppError>;
}

pub struct VehicleService {
    vehicle_repo: Box<dyn VehicleRepositoryTrait>,
}

impl VehicleService {
    pub fn new(vehicle_repo: Box<dyn VehicleRepositoryTrait>) -> Self {
        Self { vehicle_repo }
    }
}

#[async_trait::async_trait]
impl VehicleServiceTrait for VehicleService {
    async fn create_vehicle(&self, dto: CreateVehicleDto) -> Result<Vehicle, AppError> {
        self.vehicle_repo.create(dto).await
    }

    async fn get_vehicle(&self, id: Uuid) -> Result<Vehicle, AppError> {
        let vehicle = self.vehicle_repo.find_by_id(id).await?;
        match vehicle {
            Some(v) => Ok(v),
            None => Err(AppError::NotFound(format!("Vehicle with id {} not found", id))),
        }
    }

    async fn list_vehicles(&self) -> Result<Vec<Vehicle>, AppError> {
        self.vehicle_repo.find_all().await
    }

    async fn update_vehicle_status(&self, id: Uuid, status: VehicleStatus) -> Result<Vehicle, AppError> {
        // Check if vehicle exists first
        if self.vehicle_repo.find_by_id(id).await?.is_none() {
            return Err(AppError::NotFound(format!("Vehicle with id {} not found", id)));
        }
        self.vehicle_repo.update_status(id, status).await
    }

    async fn delete_vehicle(&self, id: Uuid) -> Result<(), AppError> {
        // Check if vehicle exists first
        if self.vehicle_repo.find_by_id(id).await?.is_none() {
            return Err(AppError::NotFound(format!("Vehicle with id {} not found", id)));
        }
        self.vehicle_repo.delete(id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::postgres::vehicle_repo::MockVehicleRepositoryTrait;
    use crate::models::postgres::vehicle::{VehicleType, FuelType};
    use mockall::predicate::*;

    #[tokio::test]
    async fn test_create_vehicle() {
        let mut mock_repo = MockVehicleRepositoryTrait::new();
        let dto = CreateVehicleDto {
            make: "Toyota".to_string(),
            model: "Corolla".to_string(),
            year: 2022,
            vin: "VIN123".to_string(),
            license_plate: "ABC-123".to_string(),
            r#type: VehicleType::Sedan,
            current_mileage: 0,
            fuel_type: FuelType::Gasoline,
            specs: Some(serde_json::json!({})),
        };

        let created_vehicle = Vehicle {
            id: Uuid::new_v4(),
            make: "Toyota".to_string(),
            model: "Corolla".to_string(),
            year: 2022,
            vin: "VIN123".to_string(),
            license_plate: "ABC-123".to_string(),
            r#type: VehicleType::Sedan,
            status: VehicleStatus::Available,
            current_mileage: 0,
            fuel_type: FuelType::Gasoline,
            specs: Some(serde_json::json!({})),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            deleted_at: None,
        };

        let created_vehicle_clone = created_vehicle.clone();
        mock_repo
            .expect_create()
            .with(always()) // We can be more specific if we implement PartialEq for DTO
            .times(1)
            .return_once(move |_| Ok(created_vehicle_clone));

        let service = VehicleService::new(Box::new(mock_repo));
        let result = service.create_vehicle(dto).await;

        assert!(result.is_ok());
        let vehicle = result.unwrap();
        assert_eq!(vehicle.vin, "VIN123");
    }

    #[tokio::test]
    async fn test_get_vehicle_found() {
        let mut mock_repo = MockVehicleRepositoryTrait::new();
        let vehicle_id = Uuid::new_v4();
        let vehicle = Vehicle {
            id: vehicle_id,
            make: "Toyota".to_string(),
            model: "Corolla".to_string(),
            year: 2022,
            vin: "VIN123".to_string(),
            license_plate: "ABC-123".to_string(),
            r#type: VehicleType::Sedan,
            status: VehicleStatus::Available,
            current_mileage: 0,
            fuel_type: FuelType::Gasoline,
            specs: Some(serde_json::json!({})),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            deleted_at: None,
        };

        mock_repo
            .expect_find_by_id()
            .with(eq(vehicle_id))
            .times(1)
            .return_once(move |_| Ok(Some(vehicle)));

        let service = VehicleService::new(Box::new(mock_repo));
        let result = service.get_vehicle(vehicle_id).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap().id, vehicle_id);
    }

    #[tokio::test]
    async fn test_get_vehicle_not_found() {
        let mut mock_repo = MockVehicleRepositoryTrait::new();
        let vehicle_id = Uuid::new_v4();

        mock_repo
            .expect_find_by_id()
            .with(eq(vehicle_id))
            .times(1)
            .return_once(move |_| Ok(None));

        let service = VehicleService::new(Box::new(mock_repo));
        let result = service.get_vehicle(vehicle_id).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::NotFound(_) => {},
            _ => panic!("Expected NotFound error"),
        }
    }
}
