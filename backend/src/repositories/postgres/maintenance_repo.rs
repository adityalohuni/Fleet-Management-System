use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::maintenance::{
    MaintenanceRecord, CreateMaintenanceRecordDto, MaintenanceType,
    MaintenanceSchedule, CreateMaintenanceScheduleDto,
    Alert, CreateAlertDto, AlertSeverity
};
use crate::models::postgres::vehicle::VehicleType;
use crate::error::AppError;
use async_trait::async_trait;

// --- MaintenanceRecord Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait MaintenanceRecordRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateMaintenanceRecordDto) -> Result<MaintenanceRecord, AppError>;
    async fn find_by_vehicle_id(&self, vehicle_id: Uuid) -> Result<Vec<MaintenanceRecord>, AppError>;
}

pub struct MaintenanceRecordRepository {
    pool: PgPool,
}

impl MaintenanceRecordRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl MaintenanceRecordRepositoryTrait for MaintenanceRecordRepository {
    async fn create(&self, dto: CreateMaintenanceRecordDto) -> Result<MaintenanceRecord, AppError> {
        let id = Uuid::new_v4();
        let record = sqlx::query_as::<_, MaintenanceRecord>(
            r#"
            INSERT INTO maintenance_records (
                id, vehicle_id, type, cost, date, provider, description, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.vehicle_id)
        .bind(dto.r#type)
        .bind(dto.cost)
        .bind(dto.date)
        .bind(dto.provider)
        .bind(dto.description)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(record)
    }

    async fn find_by_vehicle_id(&self, vehicle_id: Uuid) -> Result<Vec<MaintenanceRecord>, AppError> {
        let records = sqlx::query_as::<_, MaintenanceRecord>(
            "SELECT * FROM maintenance_records WHERE vehicle_id = $1 ORDER BY date DESC"
        )
        .bind(vehicle_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(records)
    }
}

// --- MaintenanceSchedule Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait MaintenanceScheduleRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateMaintenanceScheduleDto) -> Result<MaintenanceSchedule, AppError>;
    async fn find_by_vehicle_type(&self, vehicle_type: VehicleType) -> Result<Option<MaintenanceSchedule>, AppError>;
}

pub struct MaintenanceScheduleRepository {
    pool: PgPool,
}

impl MaintenanceScheduleRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl MaintenanceScheduleRepositoryTrait for MaintenanceScheduleRepository {
    async fn create(&self, dto: CreateMaintenanceScheduleDto) -> Result<MaintenanceSchedule, AppError> {
        let id = Uuid::new_v4();
        let schedule = sqlx::query_as::<_, MaintenanceSchedule>(
            r#"
            INSERT INTO maintenance_schedules (
                id, vehicle_type, interval_km, interval_months
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.vehicle_type)
        .bind(dto.interval_km)
        .bind(dto.interval_months)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(schedule)
    }

    async fn find_by_vehicle_type(&self, vehicle_type: VehicleType) -> Result<Option<MaintenanceSchedule>, AppError> {
        let schedule = sqlx::query_as::<_, MaintenanceSchedule>(
            "SELECT * FROM maintenance_schedules WHERE vehicle_type = $1"
        )
        .bind(vehicle_type)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(schedule)
    }
}

// --- Alert Repository ---
#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait AlertRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateAlertDto) -> Result<Alert, AppError>;
    async fn find_unresolved(&self) -> Result<Vec<Alert>, AppError>;
    async fn resolve(&self, id: Uuid) -> Result<Alert, AppError>;
}

pub struct AlertRepository {
    pool: PgPool,
}

impl AlertRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl AlertRepositoryTrait for AlertRepository {
    async fn create(&self, dto: CreateAlertDto) -> Result<Alert, AppError> {
        let id = Uuid::new_v4();
        let alert = sqlx::query_as::<_, Alert>(
            r#"
            INSERT INTO alerts (
                id, entity_id, type, severity, is_resolved, created_at
            )
            VALUES ($1, $2, $3, $4, FALSE, NOW())
            RETURNING *
            "#
        )
        .bind(id)
        .bind(dto.entity_id)
        .bind(dto.r#type)
        .bind(dto.severity)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(alert)
    }

    async fn find_unresolved(&self) -> Result<Vec<Alert>, AppError> {
        let alerts = sqlx::query_as::<_, Alert>(
            "SELECT * FROM alerts WHERE is_resolved = FALSE ORDER BY created_at DESC"
        )
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(alerts)
    }

    async fn resolve(&self, id: Uuid) -> Result<Alert, AppError> {
        let alert = sqlx::query_as::<_, Alert>(
            r#"
            UPDATE alerts 
            SET is_resolved = TRUE, resolved_at = NOW()
            WHERE id = $1
            RETURNING *
            "#
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(alert)
    }
}
