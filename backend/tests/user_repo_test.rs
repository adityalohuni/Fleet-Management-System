use fleet_management_backend::repositories::postgres::user_repo::{UserRepository, UserRepositoryTrait};
use fleet_management_backend::models::postgres::user::{CreateUserDto, UserRole};
use sqlx::PgPool;

#[sqlx::test]
async fn test_create_and_find_user(pool: PgPool) -> sqlx::Result<()> {
    let repo = UserRepository::new(pool);

    // 1. Arrange
    let dto = CreateUserDto {
        email: "test@example.com".to_string(),
        password_hash: "hashed_password".to_string(),
        role: UserRole::Driver,
        is_active: true,
    };

    // 2. Act
    let created = repo.create(dto).await.expect("Failed to create user");
    let found = repo.find_by_id(created.id).await.expect("Failed to find user");

    // 3. Assert
    assert!(found.is_some());
    let found_user = found.unwrap();
    assert_eq!(found_user.email, "test@example.com");
    assert_eq!(found_user.role, UserRole::Driver);

    Ok(())
}

#[sqlx::test]
async fn test_soft_delete_user(pool: PgPool) -> sqlx::Result<()> {
    let repo = UserRepository::new(pool);

    // 1. Arrange
    let dto = CreateUserDto {
        email: "delete@example.com".to_string(),
        password_hash: "hashed_password".to_string(),
        role: UserRole::Manager,
        is_active: true,
    };
    let created = repo.create(dto).await.expect("Failed to create user");

    // 2. Act
    repo.delete(created.id).await.expect("Failed to delete user");
    let found = repo.find_by_id(created.id).await.expect("Failed to find user");

    // 3. Assert
    assert!(found.is_none());

    Ok(())
}
