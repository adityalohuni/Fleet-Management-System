use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::Value;
use rust_decimal::Decimal;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, ToSchema)]
pub struct Customer {
    pub id: Uuid,
    pub name: String,
    #[schema(value_type = Object)]
    pub contact_info: Value, // JSONB
    pub billing_address: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateCustomerDto {
    pub name: String,
    #[schema(value_type = Object)]
    pub contact_info: Value,
    pub billing_address: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone, Copy, PartialEq, ToSchema)]
#[sqlx(type_name = "job_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum JobStatus {
    Pending,
    InProgress,
    Delivered,
    Invoiced,
    Paid,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, ToSchema)]
pub struct TransportJob {
    pub id: Uuid,
    pub customer_id: Uuid,
    pub status: JobStatus,
    #[schema(value_type = String)]
    pub agreed_price: Decimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateTransportJobDto {
    pub customer_id: Uuid,
    pub status: JobStatus,
    #[schema(value_type = String)]
    pub agreed_price: Decimal,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Route {
    pub id: Uuid,
    pub job_id: Uuid,
    // For simplicity in MVP, we might treat these as GeoJSON or WKT strings in the struct
    // and handle conversion in the query.
    // Ideally use `geo_types::Point` with sqlx-postgis features.
    #[schema(value_type = Object)]
    pub origin: Value, // GeoJSON Point
    #[schema(value_type = Object)]
    pub destination: Value, // GeoJSON Point
    #[schema(value_type = Object)]
    pub waypoints: Option<Value>, // GeoJSON LineString
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateRouteDto {
    pub job_id: Uuid,
    #[schema(value_type = Object)]
    pub origin: Value,
    #[schema(value_type = Object)]
    pub destination: Value,
    #[schema(value_type = Object)]
    pub waypoints: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct Shipment {
    pub id: Uuid,
    pub job_id: Uuid,
    pub weight: f64,
    #[schema(value_type = Object)]
    pub dimensions: Value, // JSONB {l, w, h}
    pub r#type: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateShipmentDto {
    pub job_id: Uuid,
    pub weight: f64,
    #[schema(value_type = Object)]
    pub dimensions: Value,
    pub r#type: String,
}
