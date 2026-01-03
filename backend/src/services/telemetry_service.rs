use std::sync::Arc;
use uuid::Uuid;
use async_trait::async_trait;
use crate::error::AppError;
use crate::models::postgres::telemetry::{VehicleTelemetry, CreateVehicleTelemetryDto};
use crate::repositories::postgres::telemetry_repo::TelemetryRepositoryTrait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait TelemetryServiceTrait: Send + Sync {
    async fn create_telemetry(&self, dto: CreateVehicleTelemetryDto) -> Result<VehicleTelemetry, AppError>;
    async fn get_latest_telemetry(&self, vehicle_id: Uuid) -> Result<Option<VehicleTelemetry>, AppError>;
}

pub struct TelemetryService {
    telemetry_repo: Arc<dyn TelemetryRepositoryTrait>,
}

impl TelemetryService {
    pub fn new(telemetry_repo: Arc<dyn TelemetryRepositoryTrait>) -> Self {
        Self { telemetry_repo }
    }
}

#[async_trait]
impl TelemetryServiceTrait for TelemetryService {
    async fn create_telemetry(&self, dto: CreateVehicleTelemetryDto) -> Result<VehicleTelemetry, AppError> {
        self.telemetry_repo.create(dto).await
    }

    async fn get_latest_telemetry(&self, vehicle_id: Uuid) -> Result<Option<VehicleTelemetry>, AppError> {
        self.telemetry_repo.find_latest_by_vehicle_id(vehicle_id).await
    }
}
