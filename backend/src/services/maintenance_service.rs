use std::sync::Arc;
use uuid::Uuid;
use async_trait::async_trait;
use crate::error::AppError;
use crate::models::postgres::maintenance::{
    MaintenanceRecord, CreateMaintenanceRecordDto,
    MaintenanceSchedule, CreateMaintenanceScheduleDto,
    Alert, CreateAlertDto
};
use crate::models::postgres::vehicle::VehicleType;
use crate::repositories::postgres::maintenance_repo::{
    MaintenanceRecordRepositoryTrait, MaintenanceScheduleRepositoryTrait, AlertRepositoryTrait
};

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait MaintenanceServiceTrait: Send + Sync {
    // Maintenance Records
    async fn create_record(&self, dto: CreateMaintenanceRecordDto) -> Result<MaintenanceRecord, AppError>;
    async fn get_vehicle_records(&self, vehicle_id: Uuid) -> Result<Vec<MaintenanceRecord>, AppError>;

    // Maintenance Schedules
    async fn create_schedule(&self, dto: CreateMaintenanceScheduleDto) -> Result<MaintenanceSchedule, AppError>;
    async fn get_schedule(&self, vehicle_type: VehicleType) -> Result<Option<MaintenanceSchedule>, AppError>;

    // Alerts
    async fn create_alert(&self, dto: CreateAlertDto) -> Result<Alert, AppError>;
    async fn get_unresolved_alerts(&self) -> Result<Vec<Alert>, AppError>;
    async fn resolve_alert(&self, id: Uuid) -> Result<Alert, AppError>;
}

pub struct MaintenanceService {
    record_repo: Arc<dyn MaintenanceRecordRepositoryTrait>,
    schedule_repo: Arc<dyn MaintenanceScheduleRepositoryTrait>,
    alert_repo: Arc<dyn AlertRepositoryTrait>,
}

impl MaintenanceService {
    pub fn new(
        record_repo: Arc<dyn MaintenanceRecordRepositoryTrait>,
        schedule_repo: Arc<dyn MaintenanceScheduleRepositoryTrait>,
        alert_repo: Arc<dyn AlertRepositoryTrait>,
    ) -> Self {
        Self {
            record_repo,
            schedule_repo,
            alert_repo,
        }
    }
}

#[async_trait]
impl MaintenanceServiceTrait for MaintenanceService {
    async fn create_record(&self, dto: CreateMaintenanceRecordDto) -> Result<MaintenanceRecord, AppError> {
        self.record_repo.create(dto).await
    }

    async fn get_vehicle_records(&self, vehicle_id: Uuid) -> Result<Vec<MaintenanceRecord>, AppError> {
        self.record_repo.find_by_vehicle_id(vehicle_id).await
    }

    async fn create_schedule(&self, dto: CreateMaintenanceScheduleDto) -> Result<MaintenanceSchedule, AppError> {
        self.schedule_repo.create(dto).await
    }

    async fn get_schedule(&self, vehicle_type: VehicleType) -> Result<Option<MaintenanceSchedule>, AppError> {
        self.schedule_repo.find_by_vehicle_type(vehicle_type).await
    }

    async fn create_alert(&self, dto: CreateAlertDto) -> Result<Alert, AppError> {
        self.alert_repo.create(dto).await
    }

    async fn get_unresolved_alerts(&self) -> Result<Vec<Alert>, AppError> {
        self.alert_repo.find_unresolved().await
    }

    async fn resolve_alert(&self, id: Uuid) -> Result<Alert, AppError> {
        self.alert_repo.resolve(id).await
    }
}
