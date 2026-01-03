use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "vehicle_type", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VehicleType {
    Truck,
    Van,
    Sedan,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "vehicle_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VehicleStatus {
    Available,
    Assigned,
    Maintenance,
    OutOfService,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "fuel_type", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum FuelType {
    Diesel,
    Gasoline,
    Electric,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, PartialEq, ToSchema)]
pub struct Vehicle {
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
    pub specs: Option<Value>, // JSONB
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateVehicleDto {
    pub make: String,
    pub model: String,
    pub year: i32,
    pub vin: String,
    pub license_plate: String,
    pub r#type: VehicleType,
    pub current_mileage: i32,
    pub fuel_type: FuelType,
    pub specs: Option<Value>,
}
