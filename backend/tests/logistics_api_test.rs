use actix_web::{test, web, App};
use fleet_management_backend::routes::logistics;
use fleet_management_backend::models::postgres::logistics::{
    Customer, CreateCustomerDto,
    TransportJob, CreateTransportJobDto, JobStatus,
    Route, CreateRouteDto,
    Shipment, CreateShipmentDto
};
use fleet_management_backend::services::logistics_service::LogisticsServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub LogisticsService {}

    #[async_trait]
    impl LogisticsServiceTrait for LogisticsService {
        async fn create_customer(&self, dto: CreateCustomerDto) -> Result<Customer, AppError>;
        async fn get_customer(&self, id: Uuid) -> Result<Customer, AppError>;
        async fn list_customers(&self) -> Result<Vec<Customer>, AppError>;
        async fn delete_customer(&self, id: Uuid) -> Result<(), AppError>;
        async fn create_job(&self, dto: CreateTransportJobDto) -> Result<TransportJob, AppError>;
        async fn get_job(&self, id: Uuid) -> Result<TransportJob, AppError>;
        async fn update_job_status(&self, id: Uuid, status: JobStatus) -> Result<TransportJob, AppError>;
        async fn create_route(&self, dto: CreateRouteDto) -> Result<Route, AppError>;
        async fn get_job_route(&self, job_id: Uuid) -> Result<Option<Route>, AppError>;
        async fn create_shipment(&self, dto: CreateShipmentDto) -> Result<Shipment, AppError>;
        async fn get_job_shipments(&self, job_id: Uuid) -> Result<Vec<Shipment>, AppError>;
    }
}

#[actix_web::test]
async fn test_create_customer() {
    let mut mock_service = MockLogisticsService::new();
    let customer_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_customer = Customer {
        id: customer_id,
        name: "Acme Corp".to_string(),
        contact_info: serde_json::json!({"email": "contact@acme.com"}),
        billing_address: "123 Main St".to_string(),
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };

    let return_customer = expected_customer.clone();

    mock_service
        .expect_create_customer()
        .times(1)
        .returning(move |_| Ok(return_customer.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn LogisticsServiceTrait>))
            .configure(logistics::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/logistics/customers")
        .set_json(CreateCustomerDto {
            name: "Acme Corp".to_string(),
            contact_info: serde_json::json!({"email": "contact@acme.com"}),
            billing_address: "123 Main St".to_string(),
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_create_job() {
    let mut mock_service = MockLogisticsService::new();
    let job_id = Uuid::new_v4();
    let customer_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_job = TransportJob {
        id: job_id,
        customer_id,
        status: JobStatus::Pending,
        agreed_price: rust_decimal::Decimal::new(500, 0),
        created_at: now,
        updated_at: now,
    };

    let return_job = expected_job.clone();

    mock_service
        .expect_create_job()
        .times(1)
        .returning(move |_| Ok(return_job.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn LogisticsServiceTrait>))
            .configure(logistics::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/logistics/jobs")
        .set_json(CreateTransportJobDto {
            customer_id,
            status: JobStatus::Pending,
            agreed_price: rust_decimal::Decimal::new(500, 0),
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
