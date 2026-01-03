# Backend Testing Strategy

This document outlines the testing strategy for the Fleet Management System backend, ensuring reliability, isolation, and maintainability.

## 1. Testing Pyramid

We follow the standard testing pyramid:

1.  **Unit Tests (Fast, Isolated):**
    *   **Scope:** Domain Models, Utility functions, Service logic (with mocked repositories).
    *   **Location:** Inside the source files (`#[cfg(test)] mod tests { ... }`).
    *   **Dependencies:** None (Pure Rust).

2.  **Integration Tests (Slower, Real DB):**
    *   **Scope:** Repositories, API Endpoints.
    *   **Location:** `tests/` directory or inside modules with `sqlx::test`.
    *   **Dependencies:** Test Database (PostgreSQL), Redis.

3.  **E2E Tests (Slowest, Full System):**
    *   **Scope:** Full user flows.
    *   **Location:** Separate test suite (e.g., Postman/Newman or a separate Rust crate).

## 2. Repository Integration Tests

Testing the Data Access Layer requires a real database to verify SQL queries and constraints.

### 2.1 Principles
*   **Isolation:** Each test should run in a clean state or a transaction that rolls back.
*   **No Shared State:** Tests should not depend on data created by other tests.
*   **Setup/Teardown:** Use helper functions to seed necessary data (Fixtures) before the test action.

### 2.2 Tooling: `sqlx::test`
We use the `[sqlx::test]` attribute macro.
*   It automatically creates a new test database (or schema) for the test suite.
*   It runs migrations before the test.
*   It wraps the test in a transaction and rolls it back at the end (if configured), or we can rely on the fresh DB.

### 2.3 Test Data Management (Fixtures)
Instead of relying on a pre-seeded database dump, we define helper functions to create dependencies.

**Example:** Testing `AssignmentRepository`
1.  **Setup:**
    *   Call `create_test_vehicle()` (Raw SQL or Repo).
    *   Call `create_test_driver()` (Raw SQL or Repo).
2.  **Action:**
    *   Call `AssignmentRepository::create(vehicle.id, driver.id, ...)`.
3.  **Assert:**
    *   Check if the assignment exists in DB.
    *   Check if constraints (e.g., overlapping assignments) are enforced.

## 3. Service Layer Testing (Unit Tests)

The Service Layer contains the core business logic and should be tested in isolation from the database.

### 3.1 Principles
*   **Mocking:** We mock the Repository layer to simulate database responses (success, failure, not found).
*   **Pure Logic:** Tests focus on if statements, loops, and business rules (e.g., "Cannot assign vehicle if status is MAINTENANCE").
*   **Speed:** These tests should run extremely fast as they don't hit the DB.

### 3.2 Tooling: `mockall`
We use the `mockall` crate to generate mock implementations of our Repository traits.

**Prerequisite:** Repositories must be defined as Traits (or use `automock` on structs if possible, but Traits are cleaner for DI).

```rust
// src/repositories/vehicle_repo.rs
#[cfg_attr(test, mockall::automock)]
pub trait VehicleRepositoryTrait {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Vehicle>, AppError>;
    // ...
}
```

### 3.3 Example Service Test

```rust
// src/services/assignment_service.rs

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::vehicle_repo::MockVehicleRepositoryTrait;
    
    #[tokio::test]
    async fn test_create_assignment_fails_if_vehicle_maintenance() {
        // 1. Arrange
        let mut mock_vehicle_repo = MockVehicleRepositoryTrait::new();
        
        mock_vehicle_repo
            .expect_find_by_id()
            .returning(|_| Ok(Some(Vehicle { status: VehicleStatus::Maintenance, ... })));

        let service = AssignmentService::new(Box::new(mock_vehicle_repo), ...);

        // 2. Act
        let result = service.create_assignment(...).await;

        // 3. Assert
        assert!(matches!(result, Err(AppError::BadRequest(_))));
    }
}
```

## 4. API Layer Testing (Integration Tests)

API tests verify that the HTTP layer correctly handles requests, validates input, and maps service responses to HTTP status codes.

### 4.1 Principles
*   **Black Box:** Test the API from the outside using HTTP requests.
*   **Mocking Services:** We can mock the Service layer to isolate the API tests from business logic and database state. This allows testing edge cases (e.g., Service returns error) easily.
*   **Real Actix App:** We use `actix_web::test` to initialize the app with the real router and middleware.

### 4.2 Tooling: `actix_web::test`
*   `init_service`: Creates a testable service.
*   `TestRequest`: Builds HTTP requests.
*   `call_service`: Executes the request and returns the response.

### 4.3 Example API Test

```rust
// tests/api_tests/vehicle_api_test.rs

#[actix_web::test]
async fn test_create_vehicle_success() {
    // 1. Arrange: Mock the Service
    let mut mock_service = MockVehicleServiceTrait::new();
    mock_service
        .expect_create_vehicle()
        .returning(|_| Ok(Vehicle { ... })); // Return dummy vehicle

    // 2. Setup App with Mock Service
    let app = test::init_service(
        App::new()
            .app_data(web::Data::from(Arc::new(mock_service))) // Inject Mock
            .configure(crate::api::v1::vehicles::config) // Configure routes
    ).await;

    // 3. Act
    let req = test::TestRequest::post()
        .uri("/api/v1/vehicles")
        .set_json(CreateVehicleDto { ... })
        .to_request();
    
    let resp = test::call_service(&app, req).await;

    // 4. Assert
    assert!(resp.status().is_success());
}
```

## 5. Example Repository Test Structure

```rust
// tests/repository_tests/vehicle_repo_test.rs

use fleet_management_backend::repositories::postgres::vehicle_repo::VehicleRepository;
use fleet_management_backend::models::postgres::vehicle::{VehicleType, FuelType};
use sqlx::PgPool;

#[sqlx::test]
async fn test_create_and_find_vehicle(pool: PgPool) -> sqlx::Result<()> {
    let repo = VehicleRepository::new(pool);

    // 1. Arrange
    let make = "Toyota";
    let vin = "TESTVIN123";

    // 2. Act
    let vehicle = repo.create(make, "Camry", 2024, vin, ...).await?;
    let found = repo.find_by_id(vehicle.id).await?;

    // 3. Assert
    assert_eq!(found.unwrap().vin, vin);
    
    Ok(())
}
```

## 6. Running Tests

To run tests against a real database, ensure your `DATABASE_URL` is set (or `sqlx` will use a default).

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_create_and_find_vehicle
```

*Note: `sqlx` requires a running Postgres instance to manage test databases.*

## 7. Troubleshooting & Insights

### 7.1 Compiler Panics (Incremental Compilation)
If you encounter compiler panics (e.g., `thread 'rustc' panicked at ... def_path_hash_map.rs`), it may be due to corruption in incremental compilation artifacts.
*   **Fix:** Disable incremental compilation for the test run.
    ```bash
    CARGO_INCREMENTAL=0 cargo test --test vehicle_api_test
    ```

### 7.2 DTO Serialization in Tests
When using `actix_web::test` helpers, ensure your DTOs have the correct Serde traits derived, even if the production code doesn't strictly need them.
*   `TestRequest::set_json(&T)` requires `T: Serialize`.
*   `test::read_body_json(resp)` requires the return type `T: Deserialize`.

### 7.3 Module Visibility
Integration tests in the `tests/` directory are compiled as separate crates. They cannot access private modules of your application. Ensure that modules you want to test (like `api`, `dto`) are declared as `pub` in `src/lib.rs`.
