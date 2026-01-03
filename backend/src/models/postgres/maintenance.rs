use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use utoipa::ToSchema;
use crate::models::postgres::vehicle::VehicleType;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "maintenance_type", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MaintenanceType {
    Preventive,
    Repair,
    Inspection,
    Accident,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, ToSchema)]
pub struct MaintenanceRecord {
    pub id: Uuid,
    pub vehicle_id: Uuid,
    pub r#type: MaintenanceType,
    #[schema(value_type = String)]
    pub cost: Decimal,
    pub date: DateTime<Utc>,
    pub provider: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateMaintenanceRecordDto {
    pub vehicle_id: Uuid,
    pub r#type: MaintenanceType,
    #[schema(value_type = String)]
    pub cost: Decimal,
    pub date: DateTime<Utc>,
    pub provider: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct MaintenanceSchedule {
    pub id: Uuid,
    pub vehicle_type: VehicleType,
    pub interval_km: i32,
    pub interval_months: i32,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateMaintenanceScheduleDto {
    pub vehicle_type: VehicleType,
    pub interval_km: i32,
    pub interval_months: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "alert_severity", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AlertSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Alert {
    pub id: Uuid,
    pub entity_id: Uuid, // Could be VehicleId or DriverId
    pub r#type: String,
    pub severity: AlertSeverity,
    pub is_resolved: bool,
    pub created_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateAlertDto {
    pub entity_id: Uuid,
    pub r#type: String,
    pub severity: AlertSeverity,
}
