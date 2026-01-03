use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::assignment::{VehicleAssignment, CreateAssignmentDto, AssignmentStatus};
use crate::error::AppError;
use async_trait::async_trait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait AssignmentRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateAssignmentDto) -> Result<VehicleAssignment, AppError>;
    async fn find_all(&self) -> Result<Vec<VehicleAssignment>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<VehicleAssignment>, AppError>;
    async fn update_status(&self, id: Uuid, status: AssignmentStatus) -> Result<VehicleAssignment, AppError>;
}

pub struct AssignmentRepository {
    pool: PgPool,
}

impl AssignmentRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AssignmentRepositoryTrait for AssignmentRepository {
    async fn create(&self, dto: CreateAssignmentDto) -> Result<VehicleAssignment, AppError> {
        let id = Uuid::new_v4();
        let assignment = sqlx::query_as::<_, VehicleAssignment>(
            r#"
            INSERT INTO vehicle_assignments (
                id, vehicle_id, driver_id, start_time, end_time, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.vehicle_id)
        .bind(dto.driver_id)
        .bind(dto.start_time)
        .bind(dto.end_time)
        .bind(dto.status)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(assignment)
    }

    async fn find_all(&self) -> Result<Vec<VehicleAssignment>, AppError> {
        let assignments = sqlx::query_as::<_, VehicleAssignment>(
            "SELECT * FROM vehicle_assignments"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(assignments)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<VehicleAssignment>, AppError> {
        let assignment = sqlx::query_as::<_, VehicleAssignment>(
            "SELECT * FROM vehicle_assignments WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(assignment)
    }

    async fn update_status(&self, id: Uuid, status: AssignmentStatus) -> Result<VehicleAssignment, AppError> {
        let assignment = sqlx::query_as::<_, VehicleAssignment>(
            r#"
            UPDATE vehicle_assignments 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
            "#
        )
        .bind(status)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(assignment)
    }
}
