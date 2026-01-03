use actix_web::{test, web, App};
use fleet_management_backend::api::v1::vehicles;
use fleet_management_backend::api::dto::vehicle_dto::{CreateVehicleRequest, VehicleResponse, UpdateVehicleStatusRequest};
use fleet_management_backend::models::postgres::vehicle::{Vehicle, CreateVehicleDto, VehicleStatus, VehicleType, FuelType};
use fleet_management_backend::services::vehicle_service::VehicleServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub VehicleService {}

    #[async_trait]
    impl VehicleServiceTrait for VehicleService {
        async fn create_vehicle(&self, dto: CreateVehicleDto) -> Result<Vehicle, AppError>;
        async fn get_vehicle(&self, id: Uuid) -> Result<Vehicle, AppError>;
        async fn list_vehicles(&self) -> Result<Vec<Vehicle>, AppError>;
        async fn update_vehicle_status(&self, id: Uuid, status: VehicleStatus) -> Result<Vehicle, AppError>;
        async fn delete_vehicle(&self, id: Uuid) -> Result<(), AppError>;
    }
}

#[actix_web::test]
async fn test_create_vehicle_success() {
    let mut mock_service = MockVehicleService::new();
    
    let vehicle_id = Uuid::new_v4();
    let now = Utc::now();
    
    let expected_vehicle = Vehicle {
        id: vehicle_id,
        make: "Toyota".to_string(),
        model: "Camry".to_string(),
        year: 2024,
        vin: "VIN123".to_string(),
        license_plate: "ABC-123".to_string(),
        r#type: VehicleType::Sedan,
        status: VehicleStatus::Available,
        current_mileage: 0,
        fuel_type: FuelType::Gasoline,
        specs: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    let return_vehicle = expected_vehicle.clone();

    mock_service
        .expect_create_vehicle()
        .times(1)
        .returning(move |_| Ok(return_vehicle.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn VehicleServiceTrait>))
            .configure(vehicles::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/vehicles")
        .set_json(CreateVehicleRequest {
            make: "Toyota".to_string(),
            model: "Camry".to_string(),
            year: 2024,
            vin: "VIN123".to_string(),
            license_plate: "ABC-123".to_string(),
            r#type: VehicleType::Sedan,
            current_mileage: 0,
            fuel_type: FuelType::Gasoline,
            specs: None,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: VehicleResponse = test::read_body_json(resp).await;
    assert_eq!(body.id, vehicle_id);
    assert_eq!(body.make, "Toyota");
}

#[actix_web::test]
async fn test_get_vehicle_found() {
    let mut mock_service = MockVehicleService::new();
    let vehicle_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_vehicle = Vehicle {
        id: vehicle_id,
        make: "Toyota".to_string(),
        model: "Camry".to_string(),
        year: 2024,
        vin: "VIN123".to_string(),
        license_plate: "ABC-123".to_string(),
        r#type: VehicleType::Sedan,
        status: VehicleStatus::Available,
        current_mileage: 1000,
        fuel_type: FuelType::Gasoline,
        specs: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    mock_service
        .expect_get_vehicle()
        .with(mockall::predicate::eq(vehicle_id))
        .times(1)
        .returning(move |_| Ok(expected_vehicle.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn VehicleServiceTrait>))
            .configure(vehicles::config)
    ).await;

    let req = test::TestRequest::get()
        .uri(&format!("/vehicles/{}", vehicle_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: VehicleResponse = test::read_body_json(resp).await;
    assert_eq!(body.id, vehicle_id);
}

#[actix_web::test]
async fn test_get_vehicle_not_found() {
    let mut mock_service = MockVehicleService::new();
    let vehicle_id = Uuid::new_v4();

    mock_service
        .expect_get_vehicle()
        .with(mockall::predicate::eq(vehicle_id))
        .times(1)
        .returning(|_| Err(AppError::NotFound("Vehicle not found".to_string())));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn VehicleServiceTrait>))
            .configure(vehicles::config)
    ).await;

    let req = test::TestRequest::get()
        .uri(&format!("/vehicles/{}", vehicle_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), actix_web::http::StatusCode::NOT_FOUND);
}

#[actix_web::test]
async fn test_update_vehicle_status() {
    let mut mock_service = MockVehicleService::new();
    let vehicle_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_vehicle = Vehicle {
        id: vehicle_id,
        make: "Toyota".to_string(),
        model: "Camry".to_string(),
        year: 2024,
        vin: "VIN123".to_string(),
        license_plate: "ABC-123".to_string(),
        r#type: VehicleType::Sedan,
        status: VehicleStatus::Maintenance,
        current_mileage: 1000,
        fuel_type: FuelType::Gasoline,
        specs: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    mock_service
        .expect_update_vehicle_status()
        .with(mockall::predicate::eq(vehicle_id), mockall::predicate::eq(VehicleStatus::Maintenance))
        .times(1)
        .returning(move |_, _| Ok(expected_vehicle.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn VehicleServiceTrait>))
            .configure(vehicles::config)
    ).await;

    let req = test::TestRequest::patch()
        .uri(&format!("/vehicles/{}/status", vehicle_id))
        .set_json(UpdateVehicleStatusRequest {
            status: VehicleStatus::Maintenance,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: VehicleResponse = test::read_body_json(resp).await;
    assert_eq!(body.id, vehicle_id);
    assert_eq!(body.status, VehicleStatus::Maintenance);
}

#[actix_web::test]
async fn test_delete_vehicle() {
    let mut mock_service = MockVehicleService::new();
    let vehicle_id = Uuid::new_v4();

    mock_service
        .expect_delete_vehicle()
        .with(mockall::predicate::eq(vehicle_id))
        .times(1)
        .returning(|_| Ok(()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn VehicleServiceTrait>))
            .configure(vehicles::config)
    ).await;

    let req = test::TestRequest::delete()
        .uri(&format!("/vehicles/{}", vehicle_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), actix_web::http::StatusCode::NO_CONTENT);
}
