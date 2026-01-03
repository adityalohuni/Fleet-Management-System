use actix_web::{test, web, App};
use fleet_management_backend::api::v1::drivers;
use fleet_management_backend::api::dto::driver_dto::{CreateDriverRequest, DriverResponse, UpdateDriverStatusRequest};
use fleet_management_backend::models::postgres::driver::{Driver, CreateDriverDto, DriverStatus};
use fleet_management_backend::services::driver_service::DriverServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub DriverService {}

    #[async_trait]
    impl DriverServiceTrait for DriverService {
        async fn create_driver(&self, dto: CreateDriverDto) -> Result<Driver, AppError>;
        async fn get_driver(&self, id: Uuid) -> Result<Driver, AppError>;
        async fn list_drivers(&self) -> Result<Vec<Driver>, AppError>;
        async fn update_driver_status(&self, id: Uuid, status: DriverStatus) -> Result<Driver, AppError>;
        async fn delete_driver(&self, id: Uuid) -> Result<(), AppError>;
    }
}

#[actix_web::test]
async fn test_create_driver_success() {
    let mut mock_service = MockDriverService::new();
    
    let driver_id = Uuid::new_v4();
    let user_id = Uuid::new_v4();
    let now = Utc::now();
    
    let expected_driver = Driver {
        id: driver_id,
        user_id,
        license_number: "LIC-12345".to_string(),
        status: DriverStatus::Available,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    let return_driver = expected_driver.clone();

    mock_service
        .expect_create_driver()
        .times(1)
        .returning(move |_| Ok(return_driver.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn DriverServiceTrait>))
            .configure(drivers::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/drivers")
        .set_json(CreateDriverRequest {
            user_id,
            license_number: "LIC-12345".to_string(),
            status: DriverStatus::Available,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: DriverResponse = test::read_body_json(resp).await;
    assert_eq!(body.id, driver_id);
    assert_eq!(body.license_number, "LIC-12345");
}

#[actix_web::test]
async fn test_get_driver_found() {
    let mut mock_service = MockDriverService::new();
    let driver_id = Uuid::new_v4();
    let user_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_driver = Driver {
        id: driver_id,
        user_id,
        license_number: "LIC-12345".to_string(),
        status: DriverStatus::Available,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    mock_service
        .expect_get_driver()
        .with(mockall::predicate::eq(driver_id))
        .times(1)
        .returning(move |_| Ok(expected_driver.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn DriverServiceTrait>))
            .configure(drivers::config)
    ).await;

    let req = test::TestRequest::get()
        .uri(&format!("/drivers/{}", driver_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: DriverResponse = test::read_body_json(resp).await;
    assert_eq!(body.id, driver_id);
}

#[actix_web::test]
async fn test_get_driver_not_found() {
    let mut mock_service = MockDriverService::new();
    let driver_id = Uuid::new_v4();

    mock_service
        .expect_get_driver()
        .with(mockall::predicate::eq(driver_id))
        .times(1)
        .returning(|_| Err(AppError::NotFound("Driver not found".to_string())));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn DriverServiceTrait>))
            .configure(drivers::config)
    ).await;

    let req = test::TestRequest::get()
        .uri(&format!("/drivers/{}", driver_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), actix_web::http::StatusCode::NOT_FOUND);
}

#[actix_web::test]
async fn test_update_driver_status() {
    let mut mock_service = MockDriverService::new();
    let driver_id = Uuid::new_v4();
    let user_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_driver = Driver {
        id: driver_id,
        user_id,
        license_number: "LIC-12345".to_string(),
        status: DriverStatus::OnDuty,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    mock_service
        .expect_update_driver_status()
        .with(mockall::predicate::eq(driver_id), mockall::predicate::eq(DriverStatus::OnDuty))
        .times(1)
        .returning(move |_, _| Ok(expected_driver.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn DriverServiceTrait>))
            .configure(drivers::config)
    ).await;

    let req = test::TestRequest::patch()
        .uri(&format!("/drivers/{}/status", driver_id))
        .set_json(UpdateDriverStatusRequest {
            status: DriverStatus::OnDuty,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: DriverResponse = test::read_body_json(resp).await;
    assert_eq!(body.id, driver_id);
    assert_eq!(body.status, DriverStatus::OnDuty);
}

#[actix_web::test]
async fn test_delete_driver() {
    let mut mock_service = MockDriverService::new();
    let driver_id = Uuid::new_v4();

    mock_service
        .expect_delete_driver()
        .with(mockall::predicate::eq(driver_id))
        .times(1)
        .returning(|_| Ok(()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn DriverServiceTrait>))
            .configure(drivers::config)
    ).await;

    let req = test::TestRequest::delete()
        .uri(&format!("/drivers/{}", driver_id))
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), actix_web::http::StatusCode::NO_CONTENT);
}
