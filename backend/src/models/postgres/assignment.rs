use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "assignment_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AssignmentStatus {
    Scheduled,
    Active,
    Completed,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone, ToSchema)]
pub struct VehicleAssignment {
    pub id: Uuid,
    pub vehicle_id: Uuid,
    pub driver_id: Uuid,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub status: AssignmentStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateAssignmentDto {
    pub vehicle_id: Uuid,
    pub driver_id: Uuid,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub status: AssignmentStatus,
}
