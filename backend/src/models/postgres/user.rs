use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "user_role", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum UserRole {
    Admin,
    Manager,
    Driver,
    Mechanic,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: UserRole,
    pub name: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub permissions: Value, // JSONB
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateUserDto {
        pub name: Option<String>,
    pub email: String,
    pub password_hash: String,
    pub role: UserRole,
    pub is_active: bool,
}
