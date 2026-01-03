use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{Utc, Duration};
use utoipa::ToSchema;

use crate::error::AppError;
use crate::models::postgres::user::{User, CreateUserDto, UserRole};
use crate::repositories::postgres::user_repo::UserRepositoryTrait;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Claims {
    pub sub: Uuid,
    pub role: UserRole,
    pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct LoginDto {
    pub email: String,
    pub password: String,
}

use async_trait::async_trait;

#[async_trait]
pub trait AuthServiceTrait: Send + Sync {
    async fn register(&self, dto: CreateUserDto) -> Result<AuthResponse, AppError>;
    async fn login(&self, dto: LoginDto) -> Result<AuthResponse, AppError>;
}

pub struct AuthService {
    user_repo: Box<dyn UserRepositoryTrait>,
    jwt_secret: String,
}

impl AuthService {
    pub fn new(user_repo: Box<dyn UserRepositoryTrait>, jwt_secret: String) -> Self {
        Self { user_repo, jwt_secret }
    }

    fn generate_token(&self, user: &User) -> Result<String, AppError> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::hours(24))
            .expect("valid timestamp")
            .timestamp();

        let claims = Claims {
            sub: user.id,
            role: user.role.clone(),
            exp: expiration as usize,
        };

        encode(&Header::default(), &claims, &EncodingKey::from_secret(self.jwt_secret.as_bytes()))
            .map_err(|e| AppError::InternalServerError(e.to_string()))
    }
}

#[async_trait]
impl AuthServiceTrait for AuthService {
    async fn register(&self, mut dto: CreateUserDto) -> Result<AuthResponse, AppError> {
        // Check if user exists
        if let Some(_) = self.user_repo.find_by_email(&dto.email).await? {
            return Err(AppError::BadRequest("User with this email already exists".into()));
        }

        // Hash password
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(dto.password_hash.as_bytes(), &salt)
            .map_err(|e| AppError::InternalServerError(e.to_string()))?
            .to_string();
        
        dto.password_hash = password_hash;

        // Create user
        let user = self.user_repo.create(dto).await?;

        // Generate token
        let token = self.generate_token(&user)?;

        Ok(AuthResponse { token, user })
    }

    async fn login(&self, dto: LoginDto) -> Result<AuthResponse, AppError> {
        let user = self.user_repo.find_by_email(&dto.email).await?
            .ok_or(AppError::AuthError("Invalid email or password".into()))?;

        // Verify password
        let parsed_hash = PasswordHash::new(&user.password_hash)
            .map_err(|e| AppError::InternalServerError(e.to_string()))?;
        
        Argon2::default().verify_password(dto.password.as_bytes(), &parsed_hash)
            .map_err(|_| AppError::AuthError("Invalid email or password".into()))?;

        // Generate token
        let token = self.generate_token(&user)?;

        Ok(AuthResponse { token, user })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::postgres::user_repo::MockUserRepositoryTrait;
    use mockall::predicate::*;

    #[tokio::test]
    async fn test_register_success() {
        let mut mock_repo = MockUserRepositoryTrait::new();
        let email = "test@example.com";
        let password = "password123";

        mock_repo.expect_find_by_email()
            .with(eq(email))
            .returning(|_| Ok(None));

        mock_repo.expect_create()
            .returning(|dto| Ok(User {
                id: Uuid::new_v4(),
                email: dto.email,
                password_hash: dto.password_hash,
                role: dto.role,
                is_active: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                deleted_at: None,
            }));

        let service = AuthService::new(Box::new(mock_repo), "secret".to_string());
        let dto = CreateUserDto {
            email: email.to_string(),
            password_hash: password.to_string(),
            role: UserRole::Admin,
            is_active: true,
        };

        let result = service.register(dto).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_register_duplicate_email() {
        let mut mock_repo = MockUserRepositoryTrait::new();
        let email = "test@example.com";

        mock_repo.expect_find_by_email()
            .with(eq(email))
            .returning(|_| Ok(Some(User {
                id: Uuid::new_v4(),
                email: "test@example.com".to_string(),
                password_hash: "hash".to_string(),
                role: UserRole::Admin,
                is_active: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                deleted_at: None,
            })));

        let service = AuthService::new(Box::new(mock_repo), "secret".to_string());
        let dto = CreateUserDto {
            email: email.to_string(),
            password_hash: "password".to_string(),
            role: UserRole::Admin,
            is_active: true,
        };

        let result = service.register(dto).await;
        assert!(matches!(result, Err(AppError::BadRequest(_))));
    }
}
