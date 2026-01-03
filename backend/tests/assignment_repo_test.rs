use fleet_management_backend::repositories::postgres::assignment_repo::AssignmentRepository;
use fleet_management_backend::repositories::AssignmentRepositoryTrait;
use fleet_management_backend::models::postgres::assignment::{CreateAssignmentDto, AssignmentStatus};
use sqlx::PgPool;
use chrono::{Utc, Duration};

mod common;

#[sqlx::test]
async fn test_create_and_find_assignment(pool: PgPool) -> sqlx::Result<()> {
    let assignment_repo = AssignmentRepository::new(pool.clone());

    // 1. Arrange - Create Dependencies using Helpers
    let vehicle = common::create_test_vehicle(&pool).await;
    let (_, driver) = common::create_test_driver(&pool).await;

    // 2. Arrange - Create Assignment DTO
    let assignment_dto = CreateAssignmentDto {
        vehicle_id: vehicle.id,
        driver_id: driver.id,
        start_time: Utc::now(),
        end_time: Some(Utc::now() + Duration::hours(8)),
        status: AssignmentStatus::Scheduled,
    };

    // 3. Act
    let created = assignment_repo.create(assignment_dto).await.expect("Failed to create assignment");
    let found = assignment_repo.find_by_id(created.id).await.expect("Failed to find assignment");

    // 4. Assert
    assert!(found.is_some());
    let found_assignment = found.unwrap();
    assert_eq!(found_assignment.vehicle_id, vehicle.id);
    assert_eq!(found_assignment.driver_id, driver.id);
    assert_eq!(found_assignment.status, AssignmentStatus::Scheduled);

    Ok(())
}
