use sqlx::PgPool;
use crate::models::postgres::settings::{AppSettings, UpdateAppSettingsDto};
use crate::error::AppError;
use async_trait::async_trait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait SettingsRepositoryTrait: Send + Sync {
    async fn get(&self) -> Result<AppSettings, AppError>;
    async fn update(&self, dto: UpdateAppSettingsDto) -> Result<AppSettings, AppError>;
}

pub struct SettingsRepository {
    pool: PgPool,
}

impl SettingsRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl SettingsRepositoryTrait for SettingsRepository {
    async fn get(&self) -> Result<AppSettings, AppError> {
        let settings = sqlx::query_as::<_, AppSettings>(
            "SELECT * FROM app_settings WHERE id = 1"
        )
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(settings)
    }

    async fn update(&self, dto: UpdateAppSettingsDto) -> Result<AppSettings, AppError> {
        let settings = sqlx::query_as::<_, AppSettings>(
            r#"
            UPDATE app_settings
            SET
              company_name = $1,
              contact_email = $2,
              phone_number = $3,
              time_zone = $4,
              address = $5,
              distance_unit = $6,
              currency = $7,
              date_format = $8,
              notify_maintenance_alerts = $9,
              notify_license_expiry = $10,
              notify_service_completion = $11,
              notify_payment = $12,
              notify_sms = $13,
              notify_desktop = $14,
              notify_weekly_summary = $15,
              updated_at = NOW()
            WHERE id = 1
            RETURNING *
            "#
        )
        .bind(dto.company_name)
        .bind(dto.contact_email)
        .bind(dto.phone_number)
        .bind(dto.time_zone)
        .bind(dto.address)
        .bind(dto.distance_unit)
        .bind(dto.currency)
        .bind(dto.date_format)
        .bind(dto.notify_maintenance_alerts)
        .bind(dto.notify_license_expiry)
        .bind(dto.notify_service_completion)
        .bind(dto.notify_payment)
        .bind(dto.notify_sms)
        .bind(dto.notify_desktop)
        .bind(dto.notify_weekly_summary)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(settings)
    }
}
