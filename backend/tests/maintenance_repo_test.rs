use fleet_management_backend::repositories::postgres::maintenance_repo::{
    MaintenanceRecordRepository, MaintenanceScheduleRepository, AlertRepository
};
use fleet_management_backend::repositories::{
    MaintenanceRecordRepositoryTrait, MaintenanceScheduleRepositoryTrait, AlertRepositoryTrait
};
use fleet_management_backend::models::postgres::maintenance::{
    CreateMaintenanceRecordDto, MaintenanceType, CreateMaintenanceScheduleDto,
    CreateAlertDto, AlertSeverity
};
use fleet_management_backend::models::postgres::vehicle::VehicleType;
use sqlx::PgPool;
use chrono::Utc;
use rust_decimal::Decimal;

mod common;

#[sqlx::test]
async fn test_maintenance_flow(pool: PgPool) -> sqlx::Result<()> {
    let record_repo = MaintenanceRecordRepository::new(pool.clone());
    let schedule_repo = MaintenanceScheduleRepository::new(pool.clone());
    let alert_repo = AlertRepository::new(pool.clone());

    // 1. Create Vehicle using Helper
    let vehicle = common::create_test_vehicle(&pool).await;

    // 2. Create Maintenance Record
    let record_dto = CreateMaintenanceRecordDto {
        vehicle_id: vehicle.id,
        r#type: MaintenanceType::Preventive,
        cost: Decimal::new(15000, 2), // 150.00
        date: Utc::now(),
        provider: "QuickFix".to_string(),
        description: Some("Oil change".to_string()),
    };
    let record = record_repo.create(record_dto).await.expect("Failed to create record");
    
    let records = record_repo.find_by_vehicle_id(vehicle.id).await.expect("Failed to find records");
    assert_eq!(records.len(), 1);
    assert_eq!(records[0].id, record.id);

    // 3. Create Maintenance Schedule
    let schedule_dto = CreateMaintenanceScheduleDto {
        vehicle_type: VehicleType::Van,
        interval_km: 15000,
        interval_months: 6,
    };
    let schedule = schedule_repo.create(schedule_dto).await.expect("Failed to create schedule");
    
    let found_schedule = schedule_repo.find_by_vehicle_type(VehicleType::Van).await.expect("Failed to find schedule");
    assert!(found_schedule.is_some());
    assert_eq!(found_schedule.unwrap().id, schedule.id);

    // 4. Create Alert
    let alert_dto = CreateAlertDto {
        entity_id: vehicle.id,
        r#type: "EngineCheck".to_string(),
        severity: AlertSeverity::High,
    };
    let alert = alert_repo.create(alert_dto).await.expect("Failed to create alert");
    
    let unresolved = alert_repo.find_unresolved().await.expect("Failed to find unresolved alerts");
    assert!(!unresolved.is_empty());

    // 5. Resolve Alert
    let resolved = alert_repo.resolve(alert.id).await.expect("Failed to resolve alert");
    assert!(resolved.is_resolved);
    assert!(resolved.resolved_at.is_some());

    Ok(())
}
