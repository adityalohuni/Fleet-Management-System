# Backend Clean Architecture

This document defines the code architecture for the Fleet Management System backend. We follow a **Layered Architecture** (also known as N-Tier) adapted for Rust and Actix-web, ensuring separation of concerns, testability, and maintainability.

## 1. High-Level Overview

The application is divided into four distinct layers. Data flows from the top (API) down to the bottom (Database), and errors bubble up.

```mermaid
graph TD
    Client[Client / Frontend] --> Middleware[Middleware (Auth, CORS)]
    Middleware --> API[API Layer (Routes/Handlers)]
    API --> Service[Service Layer (Business Logic)]
    Service --> Repository[Repository Layer (Data Access)]
    Repository --> DB[(PostgreSQL / Redis / S3)]
```

## 2. Directory Structure

```text
backend/src/
├── api/                 # Presentation Layer (HTTP Handlers)
│   ├── mod.rs
│   ├── v1/
│   │   ├── vehicles.rs
│   │   ├── drivers.rs
│   │   └── ...
│   └── dto/             # Data Transfer Objects (Request/Response structs)
├── services/            # Business Logic Layer
│   ├── mod.rs
│   ├── vehicle_service.rs
│   └── ...
├── repositories/        # Data Access Layer (ORM / Database Code)
│   ├── mod.rs
│   ├── postgres/        # SQLx implementations
│   │   ├── vehicle_repo.rs
│   │   └── ...
│   └── redis/           # Redis implementations
│       └── cache_repo.rs
├── models/              # Domain Entities (Structs matching DB tables)
│   ├── postgres/
│   └── redis/
├── middleware/          # Cross-cutting concerns
│   ├── auth.rs
│   └── logging.rs
├── config/              # Configuration & Environment variables
├── error.rs             # Centralized Error Handling
└── main.rs              # Application Entrypoint & Wiring
```

## 3. Layer Responsibilities & Dependencies

The architecture enforces a strict **unidirectional dependency flow**. Inner layers should never depend on outer layers.

### 3.1 API Layer (`src/api`)
*   **Depends on:** `Services`, `Models`, `DTOs`.
*   **Responsibility:** Handle HTTP requests, parse JSON/Query parameters, validate input (using DTOs), call the Service layer, and format the HTTP response.
*   **Rules:**
    *   No business logic here.
    *   No direct database access.
    *   Returns `Result<HttpResponse, AppError>`.

### 3.2 Service Layer (`src/services`)
*   **Depends on:** `Repositories`, `Models`.
*   **Responsibility:** Implement the core business logic. Orchestrate calls to multiple repositories (e.g., "Create Vehicle" -> Save to Postgres -> Update Redis Cache).
*   **Rules:**
    *   **MUST NOT** depend on the API layer (no HTTP concepts).
    *   Database agnostic (mostly).
    *   Accepts Domain Models or DTOs.
    *   Performs complex validations (e.g., "Is driver available?").

### 3.3 Repository Layer (`src/repositories`)
*   **Depends on:** `Models`, `Database Drivers` (SQLx, Redis).
*   **Responsibility:** Abstract the underlying storage mechanism. Contains the actual SQL queries or Redis commands.
*   **Structure:**
    *   **Postgres Repositories:** Use `sqlx::PgPool`.
    *   **Redis Repositories:** Use `redis::Client`.
*   **Rules:**
    *   **MUST NOT** depend on Services or API.
    *   One repository per entity/aggregate (e.g., `VehicleRepository`).
    *   Methods should be granular (e.g., `find_by_id`, `save`, `delete`).

### 3.4 Models (`src/models`)
*   **Depends on:** *Nothing* (Core Domain).
*   **Responsibility:** Define the shape of the data as it exists in the database.
*   **Rules:**
    *   Pure Rust structs.
    *   Annotated with `sqlx::FromRow` or `serde::Serialize`.


## 4. Implementation Details

### 4.1 Dependency Injection
We use Actix-web's `web::Data` for dependency injection. Services and Repositories are initialized in `main.rs` and passed to the application state.

```rust
// main.rs
let db_pool = db::init_postgres().await;
let redis_client = db::init_redis().await;

// Initialize Repositories
let vehicle_repo = VehicleRepository::new(db_pool.clone());

// Initialize Services
let vehicle_service = VehicleService::new(vehicle_repo);

App::new()
    .app_data(web::Data::new(vehicle_service))
    // ...
```

### 4.2 Error Handling (`src/error.rs`)
We use a custom `AppError` enum that implements `actix_web::ResponseError`. This allows us to use `?` operator throughout the stack, and the error is automatically converted to the correct HTTP status code at the API layer.

```rust
pub enum AppError {
    NotFound(String),
    ValidationError(String),
    DatabaseError(sqlx::Error),
    InternalServerError,
}
```

### 4.3 Middleware
*   **AuthMiddleware:** Intercepts requests, validates JWT tokens, and injects `UserId` into the request extensions.
*   **Logger:** Standard `actix-web` logger for request tracing.

## 5. Example Workflow: "Create Vehicle"

1.  **Request:** `POST /api/v1/vehicles` with JSON body.
2.  **Middleware:** Checks if user is Admin.
3.  **API (`api::vehicles::create`):**
    *   Deserializes JSON to `CreateVehicleDto`.
    *   Validates fields (e.g., VIN format).
    *   Calls `vehicle_service.create_vehicle(dto)`.
4.  **Service (`services::vehicle_service`):**
    *   Checks if VIN already exists (optional business check).
    *   Converts DTO to `Vehicle` model.
    *   Calls `vehicle_repo.save(vehicle)`.
5.  **Repository (`repositories::postgres::vehicle_repo`):**
    *   Executes `INSERT INTO vehicles ...` using SQLx.
    *   Returns the created `Vehicle`.
6.  **Response:** API layer returns `201 Created` with the vehicle JSON.
