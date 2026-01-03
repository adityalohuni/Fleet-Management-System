use fleet_management_backend::repositories::postgres::driver_repo::{DriverRepository, DriverRepositoryTrait};
use fleet_management_backend::models::postgres::driver::{CreateDriverDto, DriverStatus};
use fleet_management_backend::models::postgres::user::UserRole;
use sqlx::PgPool;

mod common;

#[sqlx::test]
async fn test_create_and_find_driver(pool: PgPool) -> sqlx::Result<()> {
    let driver_repo = DriverRepository::new(pool.clone());

    // 1. Arrange - Create User using Helper
    let user = common::create_test_user(&pool, UserRole::Driver).await;

    // 2. Arrange - Create Driver DTO
    let driver_dto = CreateDriverDto {
        user_id: user.id,
        license_number: "DL123456".to_string(),
        status: DriverStatus::Available,
    };

    // 3. Act
    let created = driver_repo.create(driver_dto).await.expect("Failed to create driver");
    let found = driver_repo.find_by_id(created.id).await.expect("Failed to find driver");

    // 4. Assert
    assert!(found.is_some());
    let found_driver = found.unwrap();
    assert_eq!(found_driver.license_number, "DL123456");
    assert_eq!(found_driver.user_id, user.id);

    Ok(())
}
