use std::sync::Arc;
use async_trait::async_trait;

use crate::error::AppError;
use crate::models::postgres::settings::{AppSettings, UpdateAppSettingsDto};
use crate::repositories::postgres::settings_repo::SettingsRepositoryTrait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait SettingsServiceTrait: Send + Sync {
    async fn get_settings(&self) -> Result<AppSettings, AppError>;
    async fn update_settings(&self, dto: UpdateAppSettingsDto) -> Result<AppSettings, AppError>;
}

pub struct SettingsService {
    repo: Arc<dyn SettingsRepositoryTrait>,
}

impl SettingsService {
    pub fn new(repo: Arc<dyn SettingsRepositoryTrait>) -> Self {
        Self { repo }
    }
}

#[async_trait]
impl SettingsServiceTrait for SettingsService {
    async fn get_settings(&self) -> Result<AppSettings, AppError> {
        self.repo.get().await
    }

    async fn update_settings(&self, dto: UpdateAppSettingsDto) -> Result<AppSettings, AppError> {
        self.repo.update(dto).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::postgres::settings_repo::MockSettingsRepositoryTrait;
    use chrono::Utc;

    fn sample_settings() -> AppSettings {
        AppSettings {
            id: 1,
            company_name: "Acme".into(),
            contact_email: "admin@acme.com".into(),
            phone_number: "123".into(),
            time_zone: "UTC".into(),
            address: "addr".into(),
            distance_unit: "Miles".into(),
            currency: "USD".into(),
            date_format: "YYYY-MM-DD".into(),
            notify_maintenance_alerts: true,
            notify_license_expiry: true,
            notify_service_completion: true,
            notify_payment: true,
            notify_sms: false,
            notify_desktop: false,
            notify_weekly_summary: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }

    #[tokio::test]
    async fn test_get_settings() {
        let mut mock_repo = MockSettingsRepositoryTrait::new();
        mock_repo.expect_get().returning(|| Ok(sample_settings()));

        let service = SettingsService::new(Arc::new(mock_repo));
        let result = service.get_settings().await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap().id, 1);
    }

    #[tokio::test]
    async fn test_update_settings() {
        let mut mock_repo = MockSettingsRepositoryTrait::new();
        mock_repo
            .expect_update()
            .returning(|_| Ok(sample_settings()));

        let service = SettingsService::new(Arc::new(mock_repo));
        let dto = UpdateAppSettingsDto {
            company_name: "Acme".into(),
            contact_email: "admin@acme.com".into(),
            phone_number: "123".into(),
            time_zone: "UTC".into(),
            address: "addr".into(),
            distance_unit: "Miles".into(),
            currency: "USD".into(),
            date_format: "YYYY-MM-DD".into(),
            notify_maintenance_alerts: true,
            notify_license_expiry: true,
            notify_service_completion: true,
            notify_payment: true,
            notify_sms: false,
            notify_desktop: false,
            notify_weekly_summary: true,
        };

        let result = service.update_settings(dto).await;
        assert!(result.is_ok());
    }
}
