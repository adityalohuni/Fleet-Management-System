use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, ToSchema)]
pub struct VehicleTelemetry {
    pub time: DateTime<Utc>,
    pub vehicle_id: Uuid,
    #[schema(value_type = Object)]
    pub location: Value, // GeoJSON Point
    pub speed: f64,
    pub fuel_level: f64,
    #[schema(value_type = Object)]
    pub engine_status: Value, // JSONB
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateVehicleTelemetryDto {
    pub time: DateTime<Utc>,
    pub vehicle_id: Uuid,
    #[schema(value_type = Object)]
    pub location: Value,
    pub speed: f64,
    pub fuel_level: f64,
    #[schema(value_type = Object)]
    pub engine_status: Value,
}
