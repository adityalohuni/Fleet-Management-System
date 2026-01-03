use serde::{Deserialize, Serialize};
use validator::Validate;
use utoipa::ToSchema;
use serde_json::Value;
use crate::models::postgres::vehicle::{VehicleType, FuelType, VehicleStatus, Vehicle};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct CreateVehicleRequest {
    #[validate(length(min = 1))]
    pub make: String,
    #[validate(length(min = 1))]
    pub model: String,
    #[validate(range(min = 1900, max = 2100))]
    pub year: i32,
    #[validate(length(min = 1))]
    pub vin: String,
    #[validate(length(min = 1))]
    pub license_plate: String,
    pub r#type: VehicleType,
    #[validate(range(min = 0))]
    pub current_mileage: i32,
    pub fuel_type: FuelType,
    pub specs: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct UpdateVehicleStatusRequest {
    pub status: VehicleStatus,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct VehicleResponse {
    pub id: Uuid,
    pub make: String,
    pub model: String,
    pub year: i32,
    pub vin: String,
    pub license_plate: String,
    pub r#type: VehicleType,
    pub status: VehicleStatus,
    pub current_mileage: i32,
    pub fuel_type: FuelType,
    pub specs: Option<Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Vehicle> for VehicleResponse {
    fn from(v: Vehicle) -> Self {
        Self {
            id: v.id,
            make: v.make,
            model: v.model,
            year: v.year,
            vin: v.vin,
            license_plate: v.license_plate,
            r#type: v.r#type,
            status: v.status,
            current_mileage: v.current_mileage,
            fuel_type: v.fuel_type,
            specs: v.specs,
            created_at: v.created_at,
            updated_at: v.updated_at,
        }
    }
}
