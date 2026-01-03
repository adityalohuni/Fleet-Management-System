use actix_web::{test, web, App};
use fleet_management_backend::routes::telemetry;
use fleet_management_backend::models::postgres::telemetry::{VehicleTelemetry, CreateVehicleTelemetryDto};
use fleet_management_backend::services::telemetry_service::TelemetryServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub TelemetryService {}

    #[async_trait]
    impl TelemetryServiceTrait for TelemetryService {
        async fn create_telemetry(&self, dto: CreateVehicleTelemetryDto) -> Result<VehicleTelemetry, AppError>;
        async fn get_latest_telemetry(&self, vehicle_id: Uuid) -> Result<Option<VehicleTelemetry>, AppError>;
    }
}

#[actix_web::test]
async fn test_create_telemetry() {
    let mut mock_service = MockTelemetryService::new();
    let vehicle_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_telemetry = VehicleTelemetry {
        time: now,
        vehicle_id,
        location: serde_json::json!({"lat": 40.7128, "lng": -74.0060}),
        speed: 60.0,
        fuel_level: 80.0,
        engine_status: serde_json::json!({"temp": 90}),
    };

    let return_telemetry = expected_telemetry.clone();

    mock_service
        .expect_create_telemetry()
        .times(1)
        .returning(move |_| Ok(return_telemetry.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn TelemetryServiceTrait>))
            .configure(telemetry::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/telemetry")
        .set_json(CreateVehicleTelemetryDto {
            time: now,
            vehicle_id,
            location: serde_json::json!({"lat": 40.7128, "lng": -74.0060}),
            speed: 60.0,
            fuel_level: 80.0,
            engine_status: serde_json::json!({"temp": 90}),
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_get_latest_telemetry() {
    let mut mock_service = MockTelemetryService::new();
    let vehicle_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_telemetry = VehicleTelemetry {
        time: now,
        vehicle_id,
        location: serde_json::json!({"lat": 40.7128, "lng": -74.0060}),
        speed: 60.0,
        fuel_level: 80.0,
        engine_status: serde_json::json!({"temp": 90}),
    };

    let return_telemetry = expected_telemetry.clone();

    mock_service
        .expect_get_latest_telemetry()
        .times(1)
        .returning(move |_| Ok(Some(return_telemetry.clone())));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn TelemetryServiceTrait>))
            .configure(telemetry::config)
    ).await;

    let req = test::TestRequest::get()
        .uri(&format!("/telemetry/vehicle/{}/latest", vehicle_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
