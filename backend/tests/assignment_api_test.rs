use actix_web::{test, web, App};
use fleet_management_backend::routes::assignment;
use fleet_management_backend::models::postgres::assignment::{VehicleAssignment, CreateAssignmentDto, AssignmentStatus};
use fleet_management_backend::services::assignment_service::AssignmentServiceTrait;
use fleet_management_backend::error::AppError;
use uuid::Uuid;
use chrono::Utc;
use std::sync::Arc;
use mockall::mock;
use async_trait::async_trait;

mock! {
    pub AssignmentService {}

    #[async_trait]
    impl AssignmentServiceTrait for AssignmentService {
        async fn create_assignment(&self, dto: CreateAssignmentDto) -> Result<VehicleAssignment, AppError>;
        async fn complete_assignment(&self, id: Uuid) -> Result<VehicleAssignment, AppError>;
        async fn get_assignment(&self, id: Uuid) -> Result<VehicleAssignment, AppError>;
        async fn list_assignments(&self) -> Result<Vec<VehicleAssignment>, AppError>;
    }
}

#[actix_web::test]
async fn test_create_assignment_success() {
    let mut mock_service = MockAssignmentService::new();
    let assignment_id = Uuid::new_v4();
    let vehicle_id = Uuid::new_v4();
    let driver_id = Uuid::new_v4();
    let now = Utc::now();

    let expected_assignment = VehicleAssignment {
        id: assignment_id,
        vehicle_id,
        driver_id,
        start_time: now,
        end_time: None,
        status: AssignmentStatus::Active,
        created_at: now,
        updated_at: now,
    };

    let return_assignment = expected_assignment.clone();

    mock_service
        .expect_create_assignment()
        .times(1)
        .returning(move |_| Ok(return_assignment.clone()));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn AssignmentServiceTrait>))
            .configure(assignment::config)
    ).await;

    let req = test::TestRequest::post()
        .uri("/assignments")
        .set_json(CreateAssignmentDto {
            vehicle_id,
            driver_id,
            start_time: now,
            end_time: None,
            status: AssignmentStatus::Active,
        })
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    
    let body: VehicleAssignment = test::read_body_json(resp).await;
    assert_eq!(body.id, assignment_id);
    assert_eq!(body.status, AssignmentStatus::Active);
}

#[actix_web::test]
async fn test_list_assignments() {
    let mut mock_service = MockAssignmentService::new();
    
    mock_service
        .expect_list_assignments()
        .times(1)
        .returning(|| Ok(vec![]));

    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service) as Arc<dyn AssignmentServiceTrait>))
            .configure(assignment::config)
    ).await;

    let req = test::TestRequest::get()
        .uri("/assignments")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}
