use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::driver::{Driver, DriverWithUser, CreateDriverDto, DriverStatus};
use crate::error::AppError;
use async_trait::async_trait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait DriverRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateDriverDto) -> Result<Driver, AppError>;
    async fn find_all(&self) -> Result<Vec<Driver>, AppError>;
    async fn find_all_with_user(&self) -> Result<Vec<DriverWithUser>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Driver>, AppError>;
    async fn find_by_id_with_user(&self, id: Uuid) -> Result<Option<DriverWithUser>, AppError>;
    async fn update_status(&self, id: Uuid, status: DriverStatus) -> Result<Driver, AppError>;
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}

pub struct DriverRepository {
    pool: PgPool,
}

impl DriverRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl DriverRepositoryTrait for DriverRepository {
    async fn create(&self, dto: CreateDriverDto) -> Result<Driver, AppError> {
        let id = Uuid::new_v4();
        let driver = sqlx::query_as::<_, Driver>(
            r#"
            INSERT INTO drivers (
                id, user_id, license_number, status, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.user_id)
        .bind(dto.license_number)
        .bind(dto.status)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(driver)
    }

    async fn find_all(&self) -> Result<Vec<Driver>, AppError> {
        let drivers = sqlx::query_as::<_, Driver>(
            "SELECT * FROM drivers WHERE deleted_at IS NULL"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(drivers)
    }

    async fn find_all_with_user(&self) -> Result<Vec<DriverWithUser>, AppError> {
        let drivers = sqlx::query_as::<_, DriverWithUser>(
            r#"
            SELECT 
                d.id,
                d.user_id,
                d.license_number,
                d.status,
                u.email,
                u.name,
                d.phone,
                d.wage_rate,
                d.license_expiry,
                d.created_at,
                d.updated_at
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.deleted_at IS NULL AND u.deleted_at IS NULL
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(drivers)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Driver>, AppError> {
        let driver = sqlx::query_as::<_, Driver>(
            "SELECT * FROM drivers WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(driver)
    }

    async fn find_by_id_with_user(&self, id: Uuid) -> Result<Option<DriverWithUser>, AppError> {
        let driver = sqlx::query_as::<_, DriverWithUser>(
            r#"
            SELECT 
                d.id,
                d.user_id,
                d.license_number,
                d.status,
                u.email,
                u.name,
                d.phone,
                d.wage_rate,
                d.license_expiry,
                d.created_at,
                d.updated_at
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = $1 AND d.deleted_at IS NULL AND u.deleted_at IS NULL
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(driver)
    }

    async fn update_status(&self, id: Uuid, status: DriverStatus) -> Result<Driver, AppError> {
        let driver = sqlx::query_as::<_, Driver>(
            r#"
            UPDATE drivers 
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

        Ok(driver)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE drivers SET deleted_at = NOW() WHERE id = $1"
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Driver with id {} not found", id)));
        }

        Ok(())
    }
}
