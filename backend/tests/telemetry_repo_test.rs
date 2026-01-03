use fleet_management_backend::repositories::postgres::telemetry_repo::TelemetryRepository;
use fleet_management_backend::repositories::TelemetryRepositoryTrait;
use fleet_management_backend::models::postgres::telemetry::CreateVehicleTelemetryDto;
use sqlx::PgPool;
use chrono::Utc;
use serde_json::json;

mod common;

#[sqlx::test]
async fn test_telemetry_flow(pool: PgPool) -> sqlx::Result<()> {
    let telemetry_repo = TelemetryRepository::new(pool.clone());

    // 1. Create Vehicle using Helper
    let vehicle = common::create_test_vehicle(&pool).await;

    // 2. Create Telemetry
    let location = json!({
        "type": "Point",
        "coordinates": [-122.4194, 37.7749] // San Francisco
    });
    
    let telemetry_dto = CreateVehicleTelemetryDto {
        time: Utc::now(),
        vehicle_id: vehicle.id,
        location: location.clone(),
        speed: 65.5,
        fuel_level: 85.0,
        engine_status: json!({"temp": 90, "rpm": 0}), // Electric car RPM? :)
    };
    
    let telemetry = telemetry_repo.create(telemetry_dto).await.expect("Failed to create telemetry");
    
    // 3. Find Latest
    let latest = telemetry_repo.find_latest_by_vehicle_id(vehicle.id).await.expect("Failed to find latest telemetry");
    assert!(latest.is_some());
    let latest_telemetry = latest.unwrap();
    assert_eq!(latest_telemetry.vehicle_id, vehicle.id);
    assert_eq!(latest_telemetry.speed, 65.5);

    Ok(())
}
