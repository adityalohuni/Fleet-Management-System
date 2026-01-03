use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "driver_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DriverStatus {
    Available,
    OnDuty,
    OffDuty,
    SickLeave,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, PartialEq, ToSchema)]
pub struct Driver {
    pub id: Uuid,
    pub user_id: Uuid,
    pub license_number: String,
    pub status: DriverStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateDriverDto {
    pub user_id: Uuid,
    pub license_number: String,
    pub status: DriverStatus,
}
