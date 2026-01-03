use sqlx::PgPool;
use uuid::Uuid;
use crate::models::postgres::telemetry::{VehicleTelemetry, CreateVehicleTelemetryDto};
use crate::error::AppError;
use async_trait::async_trait;

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait TelemetryRepositoryTrait: Send + Sync {
    async fn create(&self, dto: CreateVehicleTelemetryDto) -> Result<VehicleTelemetry, AppError>;
    async fn find_latest_by_vehicle_id(&self, vehicle_id: Uuid) -> Result<Option<VehicleTelemetry>, AppError>;
}

pub struct TelemetryRepository {
    pool: PgPool,
}

impl TelemetryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl TelemetryRepositoryTrait for TelemetryRepository {
    async fn create(&self, dto: CreateVehicleTelemetryDto) -> Result<VehicleTelemetry, AppError> {
        let telemetry = sqlx::query_as::<_, VehicleTelemetry>(
            r#"
            INSERT INTO vehicle_telemetry (
                time, vehicle_id, location, speed, fuel_level, engine_status
            )
            VALUES (
                $1, 
                $2, 
                ST_SetSRID(ST_GeomFromGeoJSON($3::jsonb), 4326), 
                $4, 
                $5, 
                $6
            )
            RETURNING 
                time, 
                vehicle_id, 
                ST_AsGeoJSON(location)::jsonb as location, 
                speed, 
                fuel_level, 
                engine_status
            "#
        )
        .bind(dto.time)
        .bind(dto.vehicle_id)
        .bind(dto.location)
        .bind(dto.speed)
        .bind(dto.fuel_level)
        .bind(dto.engine_status)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(telemetry)
    }

    async fn find_latest_by_vehicle_id(&self, vehicle_id: Uuid) -> Result<Option<VehicleTelemetry>, AppError> {
        let telemetry = sqlx::query_as::<_, VehicleTelemetry>(
            r#"
            SELECT 
                time, 
                vehicle_id, 
                ST_AsGeoJSON(location)::jsonb as location, 
                speed, 
                fuel_level, 
                engine_status
            FROM vehicle_telemetry 
            WHERE vehicle_id = $1 
            ORDER BY time DESC 
            LIMIT 1
            "#
        )
        .bind(vehicle_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(telemetry)
    }
}
