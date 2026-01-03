# Repository Layer Documentation

The Repository Layer is responsible for all data access logic in the Fleet Management System. It abstracts the underlying database technologies (PostgreSQL and Redis) from the rest of the application, providing a clean API for the Service Layer to interact with data.

## Directory Structure

The repositories are organized by the underlying data store:

```text
backend/src/repositories/
├── mod.rs               # Module definitions
├── postgres/            # PostgreSQL implementations using SQLx
│   ├── mod.rs
│   ├── vehicle_repo.rs
│   ├── driver_repo.rs
│   ├── user_repo.rs
│   ├── assignment_repo.rs
│   ├── logistics_repo.rs
│   ├── maintenance_repo.rs
│   └── telemetry_repo.rs
└── redis/               # Redis implementations for caching
    ├── mod.rs
    └── vehicle_status_repo.rs
```

## PostgreSQL Repositories

We use **SQLx** for type-safe, async interactions with PostgreSQL.

### Common Patterns
- **Async/Await**: All repository methods are asynchronous.
- **Result Type**: Methods return `Result<T, AppError>` to handle database errors uniformly.
- **Soft Deletes**: Entities like Vehicles, Drivers, and Users support soft deletes (setting `deleted_at` timestamp instead of removing the row).
- **DTOs**: Create methods accept Data Transfer Objects (DTOs) to decouple API input from database entities.

### 1. Vehicle Repository (`vehicle_repo.rs`)
Manages the fleet of vehicles.
- **Key Methods**: `create`, `find_all`, `find_by_id`, `update_status`, `delete` (soft).
- **Entities**: `Vehicle`

### 2. Driver Repository (`driver_repo.rs`)
Manages driver profiles.
- **Key Methods**: `create`, `find_all`, `find_by_id`, `update_status`, `delete` (soft).
- **Entities**: `Driver`
- **Notes**: Drivers are linked to a `User` entity via `user_id`.

### 3. User Repository (`user_repo.rs`)
Handles system users and authentication data.
- **Key Methods**: `create`, `find_all`, `find_by_id`, `find_by_email`, `delete` (soft).
- **Entities**: `User`
- **Notes**: Stores hashed passwords.

### 4. Assignment Repository (`assignment_repo.rs`)
Manages the assignment of drivers to vehicles.
- **Key Methods**: `create`, `find_all`, `find_by_id`, `update_status`.
- **Entities**: `VehicleAssignment`
- **Notes**: Enforces constraints to prevent overlapping active assignments.

### 5. Logistics Repository (`logistics_repo.rs`)
Handles the complex domain of transport jobs and routing.
- **Components**:
    - `CustomerRepository`: Manage customers.
    - `TransportJobRepository`: Manage transport jobs.
    - `RouteRepository`: Manage geospatial routes (Origin, Destination, Waypoints).
    - `ShipmentRepository`: Manage cargo details.
- **GeoSpatial**: Uses PostGIS types (`GEOMETRY(POINT)`, `GEOMETRY(LINESTRING)`) mapped to GeoJSON in the application.

### 6. Maintenance Repository (`maintenance_repo.rs`)
Tracks vehicle health and maintenance.
- **Components**:
    - `MaintenanceRecordRepository`: Log service history.
    - `MaintenanceScheduleRepository`: Define service intervals.
    - `AlertRepository`: Manage system alerts (e.g., "Engine Check").

### 7. Telemetry Repository (`telemetry_repo.rs`)
Ingests and retrieves high-frequency vehicle data.
- **Key Methods**: `create`, `find_latest_by_vehicle_id`.
- **Entities**: `VehicleTelemetry`
- **Notes**: Stores location, speed, fuel level, and engine status.

## Redis Repositories

We use the **redis** crate for caching and real-time features.

### Vehicle Status Cache (`vehicle_status_repo.rs`)
Provides fast access to the latest status of a vehicle for real-time dashboards.
- **Key Methods**: `set`, `get`.
- **Data**: `VehicleStatusCache` (JSON serialized).
- **Usage**: Updated whenever telemetry is received; queried by the frontend for live map updates.

## Testing

Repositories are tested using `sqlx::test`, which provides a fresh database transaction for each test case, ensuring isolation.

Example Test (`vehicle_repo_test.rs`):
```rust
#[sqlx::test]
async fn test_create_and_find_vehicle(pool: PgPool) -> sqlx::Result<()> {
    let repo = VehicleRepository::new(pool);
    // Arrange, Act, Assert pattern
    // ...
}
```

## Error Handling

Database errors are mapped to `AppError::DatabaseError`.
Redis errors are mapped to `AppError::RedisError`.
Serialization errors are mapped to `AppError::SerializationError`.

This ensures that the Service layer receives consistent error types regardless of the underlying data source.
