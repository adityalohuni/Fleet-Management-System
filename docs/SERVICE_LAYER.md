# Service Layer Documentation

The Service Layer is the heart of the application's business logic. It sits between the API Layer (Presentation) and the Repository Layer (Data Access). Its primary responsibility is to orchestrate data flow, enforce business rules, and ensure data integrity across multiple domains.

## Architecture & Design Principles

### 1. Orchestration
Services often need to coordinate actions across multiple repositories.
*   *Example:* When assigning a driver to a vehicle, the `AssignmentService` must:
    1.  Check if the Vehicle exists and is `AVAILABLE`.
    2.  Check if the Driver exists and is `AVAILABLE`.
    3.  Create the `Assignment` record.
    4.  Update the Vehicle status to `ASSIGNED`.
    5.  Update the Driver status to `ON_DUTY`.

### 2. Transaction Management
Operations that involve multiple write steps must be atomic.
*   We use `sqlx::Transaction` to ensure that if any step fails, the entire operation is rolled back.
*   Services accept a `PgPool` but should ideally work with a `Transaction` object for multi-step operations.

### 3. Dependency Injection & Testing
To ensure the Service Layer is testable in isolation (Unit Tests), we use **Traits** to define Repository interfaces.
*   Services depend on `Box<dyn VehicleRepositoryTrait>`, not the concrete struct.
*   This allows us to inject **Mock Repositories** during testing using `mockall`.

## Key Services

### 1. `AuthService`
Handles user authentication and authorization.
*   **Dependencies**: `UserRepository`.
*   **Responsibilities**:
    *   `login(email, password)`: Verifies credentials (hashing) and issues JWTs.
    *   `register(dto)`: Creates new users with hashed passwords.
    *   `validate_token(token)`: Decodes and verifies JWTs.

### 2. `VehicleService`
Manages the lifecycle of vehicles.
*   **Dependencies**: `VehicleRepository`, `VehicleStatusCacheRepository` (Redis).
*   **Responsibilities**:
    *   CRUD operations for vehicles.
    *   `get_fleet_status()`: Merges static DB data with real-time Redis cache data (location, speed).

### 3. `DriverService`
Manages driver profiles and availability.
*   **Dependencies**: `DriverRepository`.
*   **Responsibilities**:
    *   CRUD operations.
    *   Status management (Available, On Duty, Off Duty).

### 4. `AssignmentService`
**Critical Business Logic.** Manages the relationship between Vehicles and Drivers.
*   **Dependencies**: `AssignmentRepository`, `VehicleRepository`, `DriverRepository`.
*   **Responsibilities**:
    *   `create_assignment(vehicle_id, driver_id)`: Enforces availability checks and updates statuses atomically.
    *   `complete_assignment(id)`: Marks assignment as completed and frees up the vehicle and driver.

### 5. `LogisticsService`
Handles the transport business domain.
*   **Dependencies**: `CustomerRepository`, `TransportJobRepository`, `RouteRepository`, `ShipmentRepository`.
*   **Responsibilities**:
    *   `create_job_with_route_and_shipment(...)`: A complex flow that creates a Job, its Route, and its Shipment in one transaction.
    *   `calculate_quote(...)`: Logic to estimate price based on distance and weight.

### 6. `MaintenanceService`
Ensures fleet health.
*   **Dependencies**: `MaintenanceRecordRepository`, `MaintenanceScheduleRepository`, `AlertRepository`, `VehicleRepository`.
*   **Responsibilities**:
    *   `log_maintenance(...)`: Records service and updates vehicle status (e.g., back to `AVAILABLE` if it was `MAINTENANCE`).
    *   `check_maintenance_due()`: Background job logic to check mileage vs. schedules and generate Alerts.

### 7. `TelemetryService`
Ingests high-frequency data.
*   **Dependencies**: `TelemetryRepository`, `VehicleStatusCacheRepository`, `AlertRepository`.
*   **Responsibilities**:
    *   `ingest_telemetry(dto)`:
        1.  Persist to Postgres (TimeSeries).
        2.  Update Redis Cache (Latest state).
        3.  **Real-time Analysis**: Check if `speed > limit` or `engine_temp > threshold` and create an `Alert` if necessary.

## Error Handling

Services return `Result<T, AppError>`.
*   **Validation Errors**: Return `AppError::BadRequest` (e.g., "Vehicle not available").
*   **Not Found**: Return `AppError::NotFound`.
*   **Internal**: Propagate Repository errors as `AppError::DatabaseError` or `AppError::InternalServerError`.

## Future Improvements
*   **Event Bus**: Decouple services using an event bus (e.g., RabbitMQ or internal channels). Instead of `AssignmentService` calling `VehicleService`, it could publish `AssignmentCreated` event.
