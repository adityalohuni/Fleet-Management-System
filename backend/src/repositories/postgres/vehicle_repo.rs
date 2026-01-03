use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::vehicle::{Vehicle, CreateVehicleDto, VehicleStatus};
use crate::error::AppError;
use async_trait::async_trait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait VehicleRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateVehicleDto) -> Result<Vehicle, AppError>;
    async fn find_all(&self) -> Result<Vec<Vehicle>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Vehicle>, AppError>;
    async fn update_status(&self, id: Uuid, status: VehicleStatus) -> Result<Vehicle, AppError>;
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}

pub struct VehicleRepository {
    pool: PgPool,
}

impl VehicleRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl VehicleRepositoryTrait for VehicleRepository {
    async fn create(&self, dto: CreateVehicleDto) -> Result<Vehicle, AppError> {
        let id = Uuid::new_v4();
        let vehicle = sqlx::query_as::<_, Vehicle>(
            r#"
            INSERT INTO vehicles (
                id, make, model, year, vin, license_plate, type, status, 
                current_mileage, fuel_type, specs, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.make)
        .bind(dto.model)
        .bind(dto.year)
        .bind(dto.vin)
        .bind(dto.license_plate)
        .bind(dto.r#type)
        .bind(VehicleStatus::Available) // Default status
        .bind(dto.current_mileage)
        .bind(dto.fuel_type)
        .bind(dto.specs)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(vehicle)
    }

    async fn find_all(&self) -> Result<Vec<Vehicle>, AppError> {
        let vehicles = sqlx::query_as::<_, Vehicle>(
            "SELECT * FROM vehicles WHERE deleted_at IS NULL"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(vehicles)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Vehicle>, AppError> {
        let vehicle = sqlx::query_as::<_, Vehicle>(
            "SELECT * FROM vehicles WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(vehicle)
    }

    async fn update_status(&self, id: Uuid, status: VehicleStatus) -> Result<Vehicle, AppError> {
        let vehicle = sqlx::query_as::<_, Vehicle>(
            r#"
            UPDATE vehicles 
            SET status = $1, updated_at = NOW()
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
            "#
        )
        .bind(status)
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(vehicle)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        // Soft delete
        let result = sqlx::query(
            "UPDATE vehicles SET deleted_at = NOW() WHERE id = $1"
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Vehicle with id {} not found", id)));
        }

        Ok(())
    }
}
