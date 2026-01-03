use actix_web::{test, web, App};
use fleet_management_backend::routes::auth;
use fleet_management_backend::services::auth_service::{AuthServiceTrait, AuthResponse, LoginDto, Claims};
use fleet_management_backend::models::postgres::user::{User, CreateUserDto, UserRole};
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub AuthService {}

    #[async_trait]
    impl AuthServiceTrait for AuthService {
        async fn register(&self, dto: CreateUserDto) -> Result<AuthResponse, AppError>;
        async fn login(&self, dto: LoginDto) -> Result<AuthResponse, AppError>;
    }
}

#[actix_web::test]
async fn test_register() {
    let mut mock_service = MockAuthService::new();
    let user_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_user = User {
        id: user_id,
        email: "test@example.com".to_string(),
        password_hash: "hashed".to_string(),
        role: UserRole::Driver,
        is_active: true,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    let auth_response = AuthResponse {
        token: "token".to_string(),
        user: expected_user,
    };

    // Clone for closure
    let return_response = AuthResponse {
        token: auth_response.token.clone(),
        user: User {
            id: auth_response.user.id,
            email: auth_response.user.email.clone(),
            password_hash: auth_response.user.password_hash.clone(),
            role: auth_response.user.role,
            is_active: auth_response.user.is_active,
            created_at: auth_response.user.created_at,
            updated_at: auth_response.user.updated_at,
            deleted_at: auth_response.user.deleted_at,
        },
    };

    mock_service
        .expect_register()
        .times(1)
        .returning(move |_| Ok(AuthResponse {
            token: return_response.token.clone(),
            user: User {
                id: return_response.user.id,
                email: return_response.user.email.clone(),
                password_hash: return_response.user.password_hash.clone(),
                role: return_response.user.role,
                is_active: return_response.user.is_active,
                created_at: return_response.user.created_at,
                updated_at: return_response.user.updated_at,
                deleted_at: return_response.user.deleted_at,
            },
        }));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn AuthServiceTrait>))
            .configure(auth::config_public)
    ).await;

    let req = test::TestRequest::post()
        .uri("/auth/register")
        .set_json(CreateUserDto {
            email: "test@example.com".to_string(),
            password_hash: "password".to_string(),
            role: UserRole::Driver,
            is_active: true,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_login() {
    let mut mock_service = MockAuthService::new();
    let user_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_user = User {
        id: user_id,
        email: "test@example.com".to_string(),
        password_hash: "hashed".to_string(),
        role: UserRole::Driver,
        is_active: true,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    let auth_response = AuthResponse {
        token: "token".to_string(),
        user: expected_user,
    };

    // Clone for closure
    let return_response = AuthResponse {
        token: auth_response.token.clone(),
        user: User {
            id: auth_response.user.id,
            email: auth_response.user.email.clone(),
            password_hash: auth_response.user.password_hash.clone(),
            role: auth_response.user.role,
            is_active: auth_response.user.is_active,
            created_at: auth_response.user.created_at,
            updated_at: auth_response.user.updated_at,
            deleted_at: auth_response.user.deleted_at,
        },
    };

    mock_service
        .expect_login()
        .times(1)
        .returning(move |_| Ok(AuthResponse {
            token: return_response.token.clone(),
            user: User {
                id: return_response.user.id,
                email: return_response.user.email.clone(),
                password_hash: return_response.user.password_hash.clone(),
                role: return_response.user.role,
                is_active: return_response.user.is_active,
                created_at: return_response.user.created_at,
                updated_at: return_response.user.updated_at,
                deleted_at: return_response.user.deleted_at,
            },
        }));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn AuthServiceTrait>))
            .configure(auth::config_public)
    ).await;

    let req = test::TestRequest::post()
        .uri("/auth/login")
        .set_json(LoginDto {
            email: "test@example.com".to_string(),
            password: "password".to_string(),
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
