use serde::{Deserialize, Serialize};
use validator::Validate;
use utoipa::ToSchema;
use crate::models::postgres::driver::{DriverStatus, Driver, DriverWithUser};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct CreateDriverRequest {
    pub user_id: Uuid,
    #[validate(length(min = 1))]
    pub license_number: String,
    pub status: DriverStatus,
}

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct UpdateDriverStatusRequest {
    pub status: DriverStatus,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct DriverResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub license_number: String,
    pub status: DriverStatus,
    pub email: String,
    pub name: Option<String>,
    pub phone: Option<String>,
    pub wage_rate: Option<String>,
    pub license_expiry: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Driver> for DriverResponse {
    fn from(d: Driver) -> Self {
        Self {
            id: d.id,
            user_id: d.user_id,
            license_number: d.license_number,
            status: d.status,
            email: String::from("unknown@example.com"),
            name: None,
            phone: d.phone,
            wage_rate: d.wage_rate.map(|w| w.to_string()),
            license_expiry: d.license_expiry.map(|e| e.to_string()),
            created_at: d.created_at,
            updated_at: d.updated_at,
        }
    }
}

impl From<DriverWithUser> for DriverResponse {
    fn from(d: DriverWithUser) -> Self {
        Self {
            id: d.id,
            user_id: d.user_id,
            license_number: d.license_number,
            status: d.status,
            email: d.email,
            name: d.name,
            phone: d.phone,
            wage_rate: d.wage_rate.map(|w| w.to_string()),
            license_expiry: d.license_expiry.map(|e| e.to_string()),
            created_at: d.created_at,
            updated_at: d.updated_at,
        }
    }
}
