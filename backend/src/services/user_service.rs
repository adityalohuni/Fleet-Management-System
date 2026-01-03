use std::sync::Arc;
use async_trait::async_trait;
use uuid::Uuid;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};

use crate::error::AppError;
use crate::models::postgres::user::{CreateUserDto, User, UserRole};
use crate::repositories::postgres::user_repo::UserRepositoryTrait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait UserServiceTrait: Send + Sync {
    async fn list_users(&self) -> Result<Vec<User>, AppError>;
    async fn get_user(&self, id: Uuid) -> Result<User, AppError>;
    async fn create_user(&self, dto: CreateUserDto) -> Result<User, AppError>;
    async fn update_user(&self, id: Uuid, role: UserRole, is_active: bool) -> Result<User, AppError>;
}

pub struct UserService {
    repo: Arc<dyn UserRepositoryTrait>,
}

impl UserService {
    pub fn new(repo: Arc<dyn UserRepositoryTrait>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl UserServiceTrait for UserService {
    async fn list_users(&self) -> Result<Vec<User>, AppError> {
        self.repo.find_all().await
    }

    async fn get_user(&self, id: Uuid) -> Result<User, AppError> {
        self.repo
            .find_by_id(id)
            .await?
            .ok_or(AppError::NotFound("User not found".into()))
    }

    async fn create_user(&self, mut dto: CreateUserDto) -> Result<User, AppError> {
        if self.repo.find_by_email(&dto.email).await?.is_some() {
            return Err(AppError::BadRequest("User with this email already exists".into()));
        }

        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(dto.password_hash.as_bytes(), &salt)
            .map_err(|e| AppError::InternalServerError(e.to_string()))?
            .to_string();

        dto.password_hash = password_hash;
        self.repo.create(dto).await
    }

    async fn update_user(&self, id: Uuid, role: UserRole, is_active: bool) -> Result<User, AppError> {
        self.repo.update(id, role, is_active).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::postgres::user_repo::MockUserRepositoryTrait;
    use chrono::Utc;
    use mockall::predicate;

    fn sample_user(id: Uuid, email: &str) -> User {
        User {
            id,
            email: email.into(),
            password_hash: "hash".into(),
            role: UserRole::Admin,
            is_active: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            deleted_at: None,
        }
    }

    #[tokio::test]
    async fn test_list_users() {
        let mut mock_repo = MockUserRepositoryTrait::new();
        mock_repo
            .expect_find_all()
            .returning(|| Ok(vec![sample_user(Uuid::new_v4(), "a@a.com")]));

        let service = UserService::new(Arc::new(mock_repo));
        let users = service.list_users().await.unwrap();
        assert_eq!(users.len(), 1);
    }

    #[tokio::test]
    async fn test_get_user_not_found() {
        let mut mock_repo = MockUserRepositoryTrait::new();
        let id = Uuid::new_v4();
        mock_repo.expect_find_by_id().returning(|_| Ok(None));

        let service = UserService::new(Arc::new(mock_repo));
        let result = service.get_user(id).await;
        assert!(matches!(result, Err(AppError::NotFound(_))));
    }

    #[tokio::test]
    async fn test_update_user() {
        let mut mock_repo = MockUserRepositoryTrait::new();
        let id = Uuid::new_v4();
        mock_repo
            .expect_update()
            .with(predicate::eq(id), predicate::eq(UserRole::Manager), predicate::eq(false))
            .returning(move |id, _, _| Ok(sample_user(id, "x@x.com")));

        let service = UserService::new(Arc::new(mock_repo));
        let updated = service.update_user(id, UserRole::Manager, false).await.unwrap();
        assert_eq!(updated.id, id);
    }

    #[tokio::test]
    async fn test_create_user_hashes_and_creates() {
        let mut mock_repo = MockUserRepositoryTrait::new();
        mock_repo.expect_find_by_email().returning(|_| Ok(None));
        mock_repo
            .expect_create()
            .with(predicate::function(|dto: &CreateUserDto| {
                dto.email == "new@example.com" && !dto.password_hash.is_empty()
            }))
            .returning(|dto| Ok(sample_user(Uuid::new_v4(), &dto.email)));

        let service = UserService::new(Arc::new(mock_repo));
        let dto = CreateUserDto {
            email: "new@example.com".into(),
            password_hash: "plain_password".into(),
            role: UserRole::Driver,
            is_active: true,
        };

        let created = service.create_user(dto).await.unwrap();
        assert_eq!(created.email, "new@example.com");
    }
}
