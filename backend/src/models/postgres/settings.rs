use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone, ToSchema)]
pub struct AppSettings {
    pub id: i16,
    pub company_name: String,
    pub contact_email: String,
    pub phone_number: String,
    pub time_zone: String,
    pub address: String,
    pub distance_unit: String,
    pub currency: String,
    pub date_format: String,
    pub notify_maintenance_alerts: bool,
    pub notify_license_expiry: bool,
    pub notify_service_completion: bool,
    pub notify_payment: bool,
    pub notify_sms: bool,
    pub notify_desktop: bool,
    pub notify_weekly_summary: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UpdateAppSettingsDto {
    pub company_name: String,
    pub contact_email: String,
    pub phone_number: String,
    pub time_zone: String,
    pub address: String,
    pub distance_unit: String,
    pub currency: String,
    pub date_format: String,
    pub notify_maintenance_alerts: bool,
    pub notify_license_expiry: bool,
    pub notify_service_completion: bool,
    pub notify_payment: bool,
    pub notify_sms: bool,
    pub notify_desktop: bool,
    pub notify_weekly_summary: bool,
}
