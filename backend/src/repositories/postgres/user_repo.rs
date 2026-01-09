use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::user::{User, CreateUserDto, UserRole};
use crate::error::AppError;
use async_trait::async_trait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait UserRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateUserDto) -> Result<User, AppError>;
    async fn find_all(&self) -> Result<Vec<User>, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, AppError>;
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError>;
    async fn update(&self, id: Uuid, role: UserRole, is_active: bool) -> Result<User, AppError>;
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}

pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepositoryTrait for UserRepository {
    async fn create(&self, dto: CreateUserDto) -> Result<User, AppError> {
        let id = Uuid::new_v4();
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (
                id, email, password_hash, role, name, is_active, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.email)
        .bind(dto.password_hash)
        .bind(dto.role)
            .bind(dto.name)
        .bind(dto.is_active)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(user)
    }

    async fn find_all(&self) -> Result<Vec<User>, AppError> {
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE deleted_at IS NULL"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(users)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(user)
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(user)
    }

    async fn update(&self, id: Uuid, role: UserRole, is_active: bool) -> Result<User, AppError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            UPDATE users
            SET role = $2,
                is_active = $3,
                updated_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING *
            "#
        )
        .bind(id)
        .bind(role)
        .bind(is_active)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        user.ok_or(AppError::NotFound(format!("User with id {} not found", id)))
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET deleted_at = NOW() WHERE id = $1"
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("User with id {} not found", id)));
        }

        Ok(())
    }
}
