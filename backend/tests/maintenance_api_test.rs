use actix_web::{test, web, App};
use fleet_management_backend::routes::maintenance;
use fleet_management_backend::models::postgres::maintenance::{
    MaintenanceRecord, CreateMaintenanceRecordDto,
    MaintenanceSchedule, CreateMaintenanceScheduleDto,
    Alert, CreateAlertDto, MaintenanceType, AlertSeverity
};
use fleet_management_backend::models::postgres::vehicle::VehicleType;
use fleet_management_backend::services::maintenance_service::MaintenanceServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub MaintenanceService {}

    #[async_trait]
    impl MaintenanceServiceTrait for MaintenanceService {
        async fn create_record(&self, dto: CreateMaintenanceRecordDto) -> Result<MaintenanceRecord, AppError>;
        async fn get_vehicle_records(&self, vehicle_id: Uuid) -> Result<Vec<MaintenanceRecord>, AppError>;
        async fn create_schedule(&self, dto: CreateMaintenanceScheduleDto) -> Result<MaintenanceSchedule, AppError>;
        async fn get_schedule(&self, vehicle_type: VehicleType) -> Result<Option<MaintenanceSchedule>, AppError>;
        async fn create_alert(&self, dto: CreateAlertDto) -> Result<Alert, AppError>;
        async fn get_unresolved_alerts(&self) -> Result<Vec<Alert>, AppError>;
        async fn resolve_alert(&self, id: Uuid) -> Result<Alert, AppError>;
    }
}

#[actix_web::test]
async fn test_create_maintenance_record() {
    let mut mock_service = MockMaintenanceService::new();
    let record_id = Uuid::new_v4();
    let vehicle_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_record = MaintenanceRecord {
        id: record_id,
        vehicle_id,
        r#type: MaintenanceType::Preventive,
        cost: rust_decimal::Decimal::new(100, 0),
        date: now,
        provider: "Service Center".to_string(),
        description: Some("Oil change".to_string()),
        created_at: now,
    };

    let return_record = expected_record.clone();

    mock_service
        .expect_create_record()
        .times(1)
        .returning(move |_| Ok(return_record.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn MaintenanceServiceTrait>))
            .configure(maintenance::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/maintenance/records")
        .set_json(CreateMaintenanceRecordDto {
            vehicle_id,
            r#type: MaintenanceType::Preventive,
            cost: rust_decimal::Decimal::new(100, 0),
            date: now,
            provider: "Service Center".to_string(),
            description: Some("Oil change".to_string()),
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_get_unresolved_alerts() {
    let mut mock_service = MockMaintenanceService::new();
    
    mock_service
        .expect_get_unresolved_alerts()
        .times(1)
        .returning(|| Ok(vec![]));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn MaintenanceServiceTrait>))
            .configure(maintenance::config)
    ).await;

    let req = test::TestRequest::get()
        .uri("/maintenance/alerts")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
