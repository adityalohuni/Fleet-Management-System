# Fleet Management System - Backend Implementation Guide

## 1. Architecture Overview

### 1.1 Pattern: Layered Architecture (N-Tier)
The backend follows a **Clean Layered Architecture** with strict unidirectional dependencies. This ensures separation of concerns, maintainability, and testability.

**Data Flow**: Client → Middleware → API → Service → Repository → Database

**Core Principle**: Inner layers never depend on outer layers. Each layer has a single, well-defined responsibility.

```
┌─────────────────────────────────────┐
│   Client / Frontend                  │
└──────────────┬──────────────────────┘
               │ HTTPS/JSON
┌──────────────▼──────────────────────┐
│   Middleware (Auth, CORS, Logging)  │
├─────────────────────────────────────┤
│   API Layer (HTTP Handlers)         │  ← Routing, validation, response formatting
├─────────────────────────────────────┤
│   Service Layer                      │  ← Business logic, orchestration, transactions
├─────────────────────────────────────┤
│   Repository Layer                   │  ← Data access, SQL queries
├─────────────────────────────────────┤
│   Data Stores                        │
│   ├─ PostgreSQL (Primary)           │  ← Persistent data (SQLx)
│   ├─ Redis (Cache)                  │  ← Real-time data, sessions
│   └─ S3 (Files)                     │  ← Documents, images
└─────────────────────────────────────┘
```

### 1.2 Technology Stack
- **Runtime**: Rust 1.75+
- **Web Framework**: Actix-web (high-performance, actor-based)
- **Database**: PostgreSQL 16+ with SQLx (compile-time checked queries)
- **Caching**: Redis
- **GeoSpatial**: PostGIS extensions
- **Authentication**: JWT (jsonwebtoken) + Argon2 (password hashing)
- **Validation**: validator crate
- **API Documentation**: utoipa (auto-generated OpenAPI v3)
- **Serialization**: serde & serde_json

### 1.3 Directory Structure
```
backend/
├── Cargo.toml
├── migrations/                        # Database migrations
│   ├── 20240101000000_init.sql
│   └── 20240102000000_full_schema.sql
├── src/
│   ├── main.rs                       # App entrypoint & DI setup
│   ├── lib.rs                        # Module exposure for tests
│   ├── config.rs                     # Configuration & env vars
│   ├── error.rs                      # Centralized error handling
│   ├── api_docs.rs                   # OpenAPI specification
│   ├── api/                          # API Layer (Presentation)
│   │   ├── mod.rs
│   │   ├── v1/                       # Versioned endpoints
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs
│   │   │   ├── vehicles.rs
│   │   │   ├── drivers.rs
│   │   │   ├── assignments.rs
│   │   │   ├── maintenance.rs
│   │   │   ├── financial.rs
│   │   │   ├── logistics.rs
│   │   │   └── telemetry.rs
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   ├── mod.rs
│   │   │   ├── auth_dto.rs
│   │   │   ├── vehicle_dto.rs
│   │   │   ├── driver_dto.rs
│   │   │   └── ...
│   │   └── middleware/               # Custom middleware
│   │       ├── mod.rs
│   │       └── auth_middleware.rs
│   ├── services/                     # Business Logic Layer
│   │   ├── mod.rs
│   │   ├── auth_service.rs
│   │   ├── vehicle_service.rs
│   │   ├── driver_service.rs
│   │   ├── assignment_service.rs
│   │   ├── logistics_service.rs
│   │   ├── maintenance_service.rs
│   │   ├── telemetry_service.rs
│   │   └── financial_service.rs
│   ├── repositories/                 # Data Access Layer
│   │   ├── mod.rs
│   │   ├── postgres/                 # SQLx implementations
│   │   │   ├── mod.rs
│   │   │   ├── vehicle_repo.rs
│   │   │   ├── driver_repo.rs
│   │   │   ├── user_repo.rs
│   │   │   ├── assignment_repo.rs
│   │   │   ├── logistics_repo.rs
│   │   │   ├── maintenance_repo.rs
│   │   │   └── telemetry_repo.rs
│   │   └── redis/                    # Redis implementations
│   │       ├── mod.rs
│   │       └── vehicle_status_repo.rs
│   └── models/                       # Domain Entities
│       ├── mod.rs
│       ├── postgres/
│       └── redis/
└── tests/                            # Integration tests
    ├── common/
    ├── auth_api_test.rs
    ├── vehicle_api_test.rs
    └── ...
```

## 2. Layer Responsibilities

### 2.1 API Layer (`src/api/`)

**Dependencies**: Services, Models, DTOs  
**Cannot depend on**: Nothing (top layer)

#### Responsibilities
1. **HTTP Routing**: Map HTTP methods and paths to handler functions
2. **Request Deserialization**: Parse JSON bodies and query parameters into DTOs
3. **Input Validation**: Validate DTOs using the `validator` crate
4. **Authentication & Authorization**: Extract and validate JWT tokens via middleware
5. **Service Invocation**: Call appropriate service methods
6. **Response Formatting**: Convert service results to HTTP responses with proper status codes
7. **API Documentation**: Generate OpenAPI specs using `utoipa` attributes

#### Rules
- ❌ NO business logic
- ❌ NO direct database access
- ✅ Returns `Result<HttpResponse, AppError>`
- ✅ All handlers are async functions
- ✅ Use dependency injection via `web::Data`

#### Code Example: Handler
```rust
use actix_web::{web, HttpResponse};
use uuid::Uuid;
use crate::{
    api::dto::vehicle_dto::VehicleResponseDto,
    services::vehicle_service::VehicleServiceTrait,
    error::AppError,
};

#[utoipa::path(
    get,
    path = "/api/v1/vehicles/{id}",
    params(
        ("id" = Uuid, Path, description = "Vehicle ID")
    ),
    responses(
        (status = 200, description = "Vehicle found", body = VehicleResponseDto),
        (status = 404, description = "Vehicle not found"),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub async fn get_vehicle(
    path: web::Path<Uuid>,
    service: web::Data<dyn VehicleServiceTrait>,
) -> Result<HttpResponse, AppError> {
    let vehicle_id = path.into_inner();
    let vehicle = service.get_vehicle(vehicle_id).await?;
    Ok(HttpResponse::Ok().json(vehicle))
}
```

#### Data Transfer Objects (DTOs)
DTOs define the contract between client and server. They are distinct from domain models.

**Request DTOs** must implement:
- `Deserialize` - Parse from JSON
- `Validate` - Enforce validation rules
- `Serialize` - For integration testing
- `ToSchema` - For OpenAPI documentation

```rust
use serde::{Deserialize, Serialize};
use validator::Validate;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct CreateVehicleDto {
    #[validate(length(min = 1, max = 100))]
    pub make: String,
    
    #[validate(length(min = 1, max = 100))]
    pub model: String,
    
    #[validate(range(min = 1900, max = 2100))]
    pub year: i32,
    
    #[validate(length(min = 17, max = 17))]
    pub vin: String,
    
    #[validate(length(min = 1, max = 20))]
    pub license_plate: String,
    
    pub vehicle_type: VehicleType,
    pub fuel_type: FuelType,
}
```

**Response DTOs** must implement:
- `Serialize` - Convert to JSON
- `Deserialize` - For integration testing
- `ToSchema` - For OpenAPI documentation

#### Validation Patterns
```rust
use validator::Validate;

// Length validation
#[validate(length(min = 1, max = 100))]

// Range validation
#[validate(range(min = 0, max = 1000000))]

// Email validation
#[validate(email)]

// Custom validation
#[validate(custom = "validate_license_plate")]

fn validate_license_plate(value: &str) -> Result<(), ValidationError> {
    if value.chars().all(|c| c.is_alphanumeric() || c == '-') {
        Ok(())
    } else {
        Err(ValidationError::new("invalid_license_plate"))
    }
}
```

### 2.2 Service Layer (`src/services/`)

**Dependencies**: Repositories, Models  
**Cannot depend on**: API Layer (no HTTP concepts like `HttpResponse`)

#### Responsibilities
1. **Implement Business Logic**: Core domain rules and workflows
2. **Orchestrate Operations**: Coordinate multiple repository calls
3. **Transaction Management**: Ensure atomic multi-step operations
4. **Complex Validations**: Business rule enforcement (e.g., availability checks)
5. **Data Transformation**: Convert between DTOs and domain models
6. **Real-time Analysis**: Process data and trigger alerts

#### Rules
- ❌ NO HTTP concepts (status codes, headers)
- ✅ Database agnostic (work through repository traits)
- ✅ Returns `Result<T, AppError>`
- ✅ Use traits for dependency injection and testability
- ✅ Manage transactions for multi-step operations

#### Code Example: Service with Orchestration
```rust
use uuid::Uuid;
use sqlx::{PgPool, Postgres, Transaction};
use crate::{
    repositories::postgres::{
        assignment_repo::AssignmentRepositoryTrait,
        vehicle_repo::VehicleRepositoryTrait,
        driver_repo::DriverRepositoryTrait,
    },
    models::postgres::{Assignment, VehicleStatus, DriverStatus},
    error::AppError,
};

pub struct AssignmentService {
    assignment_repo: Box<dyn AssignmentRepositoryTrait>,
    vehicle_repo: Box<dyn VehicleRepositoryTrait>,
    driver_repo: Box<dyn DriverRepositoryTrait>,
    pool: PgPool,
}

impl AssignmentService {
    pub async fn create_assignment(
        &self,
        vehicle_id: Uuid,
        driver_id: Uuid,
        dto: CreateAssignmentDto,
    ) -> Result<Assignment, AppError> {
        // 1. Validate vehicle availability
        let vehicle = self.vehicle_repo.find_by_id(vehicle_id).await?;
        if vehicle.status != VehicleStatus::Available {
            return Err(AppError::BadRequest(
                "Vehicle is not available for assignment".into()
            ));
        }
        
        // 2. Validate driver availability
        let driver = self.driver_repo.find_by_id(driver_id).await?;
        if driver.status != DriverStatus::Available {
            return Err(AppError::BadRequest(
                "Driver is not available for assignment".into()
            ));
        }
        
        // 3. Check for conflicting assignments (time overlap)
        if self.assignment_repo.has_conflict(vehicle_id, driver_id, &dto.start_time, &dto.end_time).await? {
            return Err(AppError::BadRequest(
                "Assignment time conflict detected".into()
            ));
        }
        
        // 4. Create assignment and update statuses atomically
        let mut tx = self.pool.begin().await?;
        
        let assignment = self.assignment_repo.create(&dto, &mut tx).await?;
        
        self.vehicle_repo.update_status(
            vehicle_id,
            VehicleStatus::Assigned,
            &mut tx
        ).await?;
        
        self.driver_repo.update_status(
            driver_id,
            DriverStatus::OnDuty,
            &mut tx
        ).await?;
        
        tx.commit().await?;
        
        Ok(assignment)
    }
    
    pub async fn complete_assignment(
        &self,
        assignment_id: Uuid,
        end_mileage: i32,
    ) -> Result<Assignment, AppError> {
        let assignment = self.assignment_repo.find_by_id(assignment_id).await?;
        
        if assignment.status != AssignmentStatus::Active {
            return Err(AppError::BadRequest(
                "Can only complete active assignments".into()
            ));
        }
        
        // Update assignment, vehicle, and driver atomically
        let mut tx = self.pool.begin().await?;
        
        let updated = self.assignment_repo.complete(
            assignment_id,
            end_mileage,
            &mut tx
        ).await?;
        
        self.vehicle_repo.update_status(
            assignment.vehicle_id,
            VehicleStatus::Available,
            &mut tx
        ).await?;
        
        self.driver_repo.update_status(
            assignment.driver_id,
            DriverStatus::Available,
            &mut tx
        ).await?;
        
        tx.commit().await?;
        
        Ok(updated)
    }
}
```

#### Key Services Summary

| Service | Key Responsibilities |
|---------|---------------------|
| **AuthService** | Login (credential verification, JWT issuance), user registration, token validation |
| **VehicleService** | CRUD operations, fleet status (merge DB + Redis cache for real-time data) |
| **DriverService** | CRUD operations, status management, availability tracking |
| **AssignmentService** | Assignment creation with conflict detection, status transitions, atomic updates |
| **LogisticsService** | Transport job creation, route management, quote calculation |
| **MaintenanceService** | Maintenance logging, trigger evaluation, alert generation |
| **TelemetryService** | Data ingestion, cache updates, real-time alert processing |
| **FinancialService** | Profitability calculation, cost aggregation, dashboard metrics |

### 2.3 Repository Layer (`src/repositories/`)

**Dependencies**: Models, Database Drivers (SQLx, Redis)  
**Cannot depend on**: Services, API Layer

#### Responsibilities
1. **Abstract Storage**: Hide database implementation details
2. **Execute Queries**: Run SQL queries via SQLx
3. **Manage Cache**: Handle Redis operations
4. **GeoSpatial Operations**: Work with PostGIS data types
5. **Data Mapping**: Convert database rows to domain models

#### Rules
- ❌ NO business logic
- ❌ NO dependencies on Services or API
- ✅ One repository per entity/aggregate
- ✅ All methods are async
- ✅ Returns `Result<T, AppError>`
- ✅ Support soft deletes (set `deleted_at` timestamp)

#### Code Example: Repository
```rust
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use crate::{
    models::postgres::Vehicle,
    api::dto::vehicle_dto::CreateVehicleDto,
    error::AppError,
};

pub struct VehicleRepository {
    pool: PgPool,
}

impl VehicleRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
    
    pub async fn create(
        &self,
        dto: &CreateVehicleDto,
    ) -> Result<Vehicle, AppError> {
        let vehicle = sqlx::query_as!(
            Vehicle,
            r#"
            INSERT INTO vehicles (
                make, model, year, vin, license_plate,
                vehicle_type, fuel_type, status, current_mileage
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            "#,
            dto.make,
            dto.model,
            dto.year,
            dto.vin,
            dto.license_plate,
            dto.vehicle_type as _,
            dto.fuel_type as _,
            "AVAILABLE" as _,
            0
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::DatabaseError(e))?;
        
        Ok(vehicle)
    }
    
    pub async fn find_by_id(
        &self,
        id: Uuid,
    ) -> Result<Vehicle, AppError> {
        sqlx::query_as!(
            Vehicle,
            "SELECT * FROM vehicles WHERE id = $1 AND deleted_at IS NULL",
            id
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => AppError::NotFound("Vehicle not found".into()),
            _ => AppError::DatabaseError(e),
        })
    }
    
    pub async fn find_all(
        &self,
        filters: &VehicleFilters,
    ) -> Result<Vec<Vehicle>, AppError> {
        let mut query = String::from(
            "SELECT * FROM vehicles WHERE deleted_at IS NULL"
        );
        
        if let Some(status) = &filters.status {
            query.push_str(&format!(" AND status = '{}'", status));
        }
        
        if let Some(vehicle_type) = &filters.vehicle_type {
            query.push_str(&format!(" AND vehicle_type = '{}'", vehicle_type));
        }
        
        query.push_str(" ORDER BY created_at DESC");
        
        sqlx::query_as(&query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| AppError::DatabaseError(e))
    }
    
    pub async fn update_status(
        &self,
        id: Uuid,
        status: VehicleStatus,
        tx: &mut Transaction<'_, Postgres>,
    ) -> Result<(), AppError> {
        sqlx::query!(
            "UPDATE vehicles SET status = $1, updated_at = NOW() WHERE id = $2",
            status as _,
            id
        )
        .execute(tx)
        .await
        .map_err(|e| AppError::DatabaseError(e))?;
        
        Ok(())
    }
    
    pub async fn delete(
        &self,
        id: Uuid,
    ) -> Result<(), AppError> {
        // Soft delete
        sqlx::query!(
            "UPDATE vehicles SET deleted_at = NOW() WHERE id = $1",
            id
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::DatabaseError(e))?;
        
        Ok(())
    }
}
```

#### Redis Repository Example
```rust
use redis::{Client, AsyncCommands};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use crate::error::AppError;

#[derive(Serialize, Deserialize)]
pub struct VehicleStatusCache {
    pub vehicle_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
    pub speed: f32,
    pub fuel_level: f32,
    pub timestamp: i64,
}

pub struct VehicleStatusCacheRepository {
    client: Client,
}

impl VehicleStatusCacheRepository {
    pub async fn set(
        &self,
        vehicle_id: Uuid,
        status: &VehicleStatusCache,
    ) -> Result<(), AppError> {
        let mut con = self.client.get_async_connection().await
            .map_err(|e| AppError::RedisError(e))?;
        
        let key = format!("vehicle:{}:status", vehicle_id);
        let json = serde_json::to_string(status)?;
        
        con.set_ex(&key, json, 3600).await // 1 hour TTL
            .map_err(|e| AppError::RedisError(e))?;
        
        Ok(())
    }
    
    pub async fn get(
        &self,
        vehicle_id: Uuid,
    ) -> Result<Option<VehicleStatusCache>, AppError> {
        let mut con = self.client.get_async_connection().await
            .map_err(|e| AppError::RedisError(e))?;
        
        let key = format!("vehicle:{}:status", vehicle_id);
        let result: Option<String> = con.get(&key).await
            .map_err(|e| AppError::RedisError(e))?;
        
        match result {
            Some(json) => {
                let status = serde_json::from_str(&json)?;
                Ok(Some(status))
            },
            None => Ok(None),
        }
    }
}
```

### 2.4 Models Layer (`src/models/`)

**Dependencies**: None (core domain)

#### Responsibilities
- Define data structures matching database tables
- Provide type safety for database operations

#### Rules
- Pure Rust structs
- Annotated with `sqlx::FromRow` for query mapping
- Annotated with `serde::Serialize/Deserialize` for JSON conversion
- No business logic

```rust
use sqlx::FromRow;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Vehicle {
    pub id: Uuid,
    pub make: String,
    pub model: String,
    pub year: i32,
    pub vin: String,
    pub license_plate: String,
    pub vehicle_type: VehicleType,
    pub fuel_type: FuelType,
    pub status: VehicleStatus,
    pub current_mileage: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "vehicle_type", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VehicleType {
    Truck,
    Van,
    Sedan,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "vehicle_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VehicleStatus {
    Available,
    Assigned,
    Maintenance,
    OutOfService,
}
```

## 3. Dependency Injection

### 3.1 Trait-Based Injection
Services depend on repository **traits**, not concrete implementations. This enables:
- Unit testing with mock repositories
- Swapping implementations without changing service code
- Loose coupling between layers

```rust
// Define trait
#[async_trait]
pub trait VehicleRepositoryTrait: Send + Sync {
    async fn find_by_id(&self, id: Uuid) -> Result<Vehicle, AppError>;
    async fn create(&self, dto: &CreateVehicleDto) -> Result<Vehicle, AppError>;
    // ... other methods
}

// Implement trait for concrete repository
#[async_trait]
impl VehicleRepositoryTrait for VehicleRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Vehicle, AppError> {
        // Implementation
    }
}

// Service depends on trait
pub struct VehicleService {
    repo: Box<dyn VehicleRepositoryTrait>,
}
```

### 3.2 Actix-web Integration
In `main.rs`, initialize repositories and services, then register with Actix app:

```rust
use actix_web::{web, App, HttpServer};
use std::sync::Arc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize database connections
    let db_pool = db::init_postgres().await;
    let redis_client = db::init_redis().await;
    
    // Initialize repositories
    let vehicle_repo = Arc::new(VehicleRepository::new(db_pool.clone()));
    let driver_repo = Arc::new(DriverRepository::new(db_pool.clone()));
    
    // Initialize services (wrap in Arc for shared state)
    let vehicle_service = Arc::new(VehicleService::new(
        vehicle_repo as Arc<dyn VehicleRepositoryTrait>
    ));
    
    let assignment_service = Arc::new(AssignmentService::new(
        assignment_repo,
        vehicle_repo,
        driver_repo,
        db_pool.clone(),
    ));
    
    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(vehicle_service.clone()))
            .app_data(web::Data::new(assignment_service.clone()))
            .configure(configure_routes)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

### 3.3 Handler Injection
Handlers receive services via `web::Data`:

```rust
pub async fn handler(
    service: web::Data<VehicleService>,
    // or
    service: web::Data<dyn VehicleServiceTrait>,
) -> Result<HttpResponse, AppError> {
    // Use service
}
```

## 4. Error Handling

### 4.1 Centralized Error Type
All layers return `Result<T, AppError>` where `AppError` is defined in `src/error.rs`:

```rust
use actix_web::{HttpResponse, ResponseError};
use std::fmt;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    ValidationError(String),
    Unauthorized,
    Forbidden,
    DatabaseError(sqlx::Error),
    RedisError(redis::RedisError),
    SerializationError,
    InternalServerError,
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            // ... other variants
        }
    }
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::NotFound(msg) => {
                HttpResponse::NotFound().json(ErrorResponse {
                    error: "NOT_FOUND",
                    message: msg.clone(),
                })
            },
            AppError::BadRequest(msg) => {
                HttpResponse::BadRequest().json(ErrorResponse {
                    error: "BAD_REQUEST",
                    message: msg.clone(),
                })
            },
            AppError::Unauthorized => {
                HttpResponse::Unauthorized().json(ErrorResponse {
                    error: "UNAUTHORIZED",
                    message: "Authentication required".into(),
                })
            },
            AppError::Forbidden => {
                HttpResponse::Forbidden().json(ErrorResponse {
                    error: "FORBIDDEN",
                    message: "Insufficient permissions".into(),
                })
            },
            AppError::DatabaseError(_) |
            AppError::RedisError(_) |
            AppError::InternalServerError => {
                HttpResponse::InternalServerError().json(ErrorResponse {
                    error: "INTERNAL_SERVER_ERROR",
                    message: "An internal error occurred".into(),
                })
            },
            _ => HttpResponse::InternalServerError().finish(),
        }
    }
}
```

### 4.2 HTTP Status Code Mapping

| AppError Variant | HTTP Status | Use Case |
|------------------|-------------|----------|
| `ValidationError` | 400 | Input validation failed |
| `BadRequest` | 400 | Business rule violation |
| `Unauthorized` | 401 | Missing/invalid JWT token |
| `Forbidden` | 403 | Insufficient permissions (RBAC) |
| `NotFound` | 404 | Resource not found |
| `DatabaseError` | 500 | Database connection/query error |
| `RedisError` | 500 | Cache error |
| `InternalServerError` | 500 | Unexpected error |

### 4.3 Error Propagation
Use the `?` operator to propagate errors up the call stack:

```rust
pub async fn get_vehicle(id: Uuid) -> Result<Vehicle, AppError> {
    let vehicle = self.repo.find_by_id(id).await?; // Propagates AppError
    Ok(vehicle)
}
```

## 5. Transaction Management

### 5.1 Use Cases
Transactions ensure atomicity for operations involving multiple database writes:
- Creating assignment + updating vehicle/driver statuses
- Completing maintenance + resetting triggers
- Creating transport job + route + shipment

### 5.2 Pattern
```rust
use sqlx::{PgPool, Transaction, Postgres};

pub async fn multi_step_operation(&self) -> Result<(), AppError> {
    // Begin transaction
    let mut tx: Transaction<'_, Postgres> = self.pool.begin().await?;
    
    // Perform operations using &mut tx
    operation1(&mut tx).await?;
    operation2(&mut tx).await?;
    operation3(&mut tx).await?;
    
    // Commit all changes (or rollback on error)
    tx.commit().await?;
    
    Ok(())
}
```

### 5.3 Repository Transaction Support
Repository methods that participate in transactions accept `&mut Transaction`:

```rust
pub async fn update_status(
    &self,
    id: Uuid,
    status: VehicleStatus,
    tx: &mut Transaction<'_, Postgres>,
) -> Result<(), AppError> {
    sqlx::query!(
        "UPDATE vehicles SET status = $1 WHERE id = $2",
        status as _,
        id
    )
    .execute(tx)
    .await?;
    
    Ok(())
}
```

## 6. Middleware

### 6.1 Authentication Middleware
Validates JWT tokens and injects user information into request extensions.

```rust
use actix_web::{
    dev::{ServiceRequest, ServiceResponse},
    Error, HttpMessage,
};
use actix_web_httpauth::extractors::bearer::BearerAuth;

pub async fn auth_middleware(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, Error> {
    let token = credentials.token();
    
    // Validate JWT
    let claims = decode_jwt(token)?;
    
    // Inject user_id into request extensions
    req.extensions_mut().insert(claims.user_id);
    
    Ok(req)
}
```

### 6.2 CORS Configuration
```rust
use actix_cors::Cors;

let cors = Cors::default()
    .allowed_origin("http://localhost:5173") // Frontend origin
    .allowed_methods(vec!["GET", "POST", "PUT", "PATCH", "DELETE"])
    .allowed_headers(vec!["Authorization", "Content-Type"])
    .max_age(3600);

App::new().wrap(cors)
```

### 6.3 Logging
```rust
use actix_web::middleware::Logger;

App::new()
    .wrap(Logger::default())
    .wrap(Logger::new("%a %{User-Agent}i"))
```

## 7. API Documentation (OpenAPI/Swagger)

### 7.1 Setup
Using `utoipa` and `utoipa-swagger-ui`:

```rust
// src/api_docs.rs
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(
        api::v1::vehicles::get_vehicle,
        api::v1::vehicles::list_vehicles,
        api::v1::vehicles::create_vehicle,
        // ... all endpoints
    ),
    components(
        schemas(
            VehicleResponseDto,
            CreateVehicleDto,
            // ... all DTOs
        )
    ),
    tags(
        (name = "vehicles", description = "Vehicle management endpoints"),
        (name = "drivers", description = "Driver management endpoints"),
    ),
    security(
        ("bearer_auth" = [])
    )
)]
pub struct ApiDoc;

// In main.rs
use utoipa_swagger_ui::SwaggerUi;

App::new()
    .service(
        SwaggerUi::new("/swagger-ui/{_:.*}")
            .url("/api-docs/openapi.json", ApiDoc::openapi())
    )
```

### 7.2 Access Documentation
- **Swagger UI**: `http://127.0.0.1:8080/swagger-ui/`
- **OpenAPI JSON Spec**: `http://127.0.0.1:8080/api-docs/openapi.json`

### 7.3 Authentication in Swagger
1. Call `/auth/login` endpoint to get JWT token
2. Click **"Authorize"** button in Swagger UI
3. Enter: `Bearer <your_token>`
4. Click "Authorize" and "Close"
5. Now you can execute protected endpoints

### 7.4 Annotating Endpoints
```rust
#[utoipa::path(
    post,
    path = "/api/v1/vehicles",
    request_body = CreateVehicleDto,
    responses(
        (status = 201, description = "Vehicle created", body = VehicleResponseDto),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "vehicles"
)]
pub async fn create_vehicle(...) { }
```

## 8. Testing Strategies

### 8.1 API Layer Testing (Integration Tests)
**Location**: `backend/tests/*_api_test.rs`  
**Tools**: `actix_web::test`  
**Pattern**: Test full HTTP request/response cycle

```rust
use actix_web::{test, App};

#[actix_web::test]
async fn test_get_vehicle_success() {
    // Arrange
    let app = test::init_service(
        App::new()
            .app_data(web::Data::new(mock_vehicle_service()))
            .configure(configure_routes)
    ).await;
    
    let req = test::TestRequest::get()
        .uri("/api/v1/vehicles/550e8400-e29b-41d4-a716-446655440000")
        .insert_header(("Authorization", "Bearer valid_token"))
        .to_request();
    
    // Act
    let resp = test::call_service(&app, req).await;
    
    // Assert
    assert_eq!(resp.status(), 200);
    
    let body: VehicleResponseDto = test::read_body_json(resp).await;
    assert_eq!(body.model, "Transit");
}

#[actix_web::test]
async fn test_create_vehicle_validation_error() {
    let app = test::init_service(App::new().configure(configure_routes)).await;
    
    let invalid_dto = CreateVehicleDto {
        make: "".to_string(), // Invalid: empty string
        // ...
    };
    
    let req = test::TestRequest::post()
        .uri("/api/v1/vehicles")
        .set_json(&invalid_dto)
        .insert_header(("Authorization", "Bearer valid_token"))
        .to_request();
    
    let resp = test::call_service(&app, req).await;
    
    assert_eq!(resp.status(), 400);
}
```

**Note**: DTOs must implement both `Serialize` and `Deserialize` for testing with `set_json()` and `read_body_json()`.

### 8.2 Service Layer Testing (Unit Tests)
**Location**: `backend/src/services/*_service.rs` with `#[cfg(test)]`  
**Tools**: `mockall` for mock repositories  
**Pattern**: Test business logic in isolation

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use mockall::mock;
    
    // Define mock
    mock! {
        VehicleRepo {}
        
        #[async_trait]
        impl VehicleRepositoryTrait for VehicleRepo {
            async fn find_by_id(&self, id: Uuid) -> Result<Vehicle, AppError>;
            async fn update_status(
                &self,
                id: Uuid,
                status: VehicleStatus,
                tx: &mut Transaction<'_, Postgres>
            ) -> Result<(), AppError>;
        }
    }
    
    #[tokio::test]
    async fn test_create_assignment_when_vehicle_unavailable() {
        // Arrange
        let mut mock_vehicle_repo = MockVehicleRepo::new();
        mock_vehicle_repo
            .expect_find_by_id()
            .with(eq(test_vehicle_id))
            .times(1)
            .returning(|_| Ok(Vehicle {
                status: VehicleStatus::Maintenance,
                ..test_vehicle()
            }));
        
        let service = AssignmentService::new(
            Box::new(mock_assignment_repo()),
            Box::new(mock_vehicle_repo),
            Box::new(mock_driver_repo()),
            test_pool(),
        );
        
        // Act
        let result = service.create_assignment(
            test_vehicle_id,
            test_driver_id,
            test_dto(),
        ).await;
        
        // Assert
        assert!(matches!(result, Err(AppError::BadRequest(_))));
    }
}
```

### 8.3 Repository Layer Testing (Database Tests)
**Location**: `backend/tests/*_repo_test.rs`  
**Tools**: `sqlx::test` (provides fresh transaction per test)  
**Pattern**: Test actual database operations

```rust
use sqlx::PgPool;

#[sqlx::test]
async fn test_create_and_find_vehicle(pool: PgPool) -> sqlx::Result<()> {
    // Arrange
    let repo = VehicleRepository::new(pool);
    let dto = CreateVehicleDto {
        make: "Ford".into(),
        model: "Transit".into(),
        year: 2023,
        vin: "1HGBH41JXMN109186".into(),
        license_plate: "ABC123".into(),
        vehicle_type: VehicleType::Van,
        fuel_type: FuelType::Diesel,
    };
    
    // Act
    let created = repo.create(&dto).await?;
    let found = repo.find_by_id(created.id).await?;
    
    // Assert
    assert_eq!(created.id, found.id);
    assert_eq!(created.make, "Ford");
    assert_eq!(found.status, VehicleStatus::Available);
    
    Ok(())
}

#[sqlx::test]
async fn test_soft_delete(pool: PgPool) -> sqlx::Result<()> {
    let repo = VehicleRepository::new(pool);
    let vehicle = create_test_vehicle(&repo).await?;
    
    // Delete
    repo.delete(vehicle.id).await?;
    
    // Should not be found
    let result = repo.find_by_id(vehicle.id).await;
    assert!(matches!(result, Err(AppError::NotFound(_))));
    
    Ok(())
}
```

## 9. Example Workflows

### 9.1 Create Vehicle
**Request**: `POST /api/v1/vehicles` with JSON body

1. **Middleware**: Validates JWT token, checks if user is Admin
2. **API Handler** (`api::v1::vehicles::create_vehicle`):
   - Deserializes JSON to `CreateVehicleDto`
   - Validates fields using `validator` crate
   - Calls `vehicle_service.create_vehicle(dto)`
3. **Service** (`VehicleService::create_vehicle`):
   - Optional: Check if VIN already exists
   - Converts DTO to `Vehicle` model
   - Calls `vehicle_repo.create(dto)`
4. **Repository** (`VehicleRepository::create`):
   - Executes `INSERT INTO vehicles ...` using SQLx
   - Returns created `Vehicle`
5. **Response**: API returns `201 Created` with vehicle JSON

### 9.2 Create Assignment (Complex Workflow)
**Request**: `POST /api/v1/assignments` with JSON body

1. **API Handler**: Deserializes `CreateAssignmentDto`, validates, calls service
2. **Service** (`AssignmentService::create_assignment`):
   - **Step 1**: Fetch vehicle, check if `status == AVAILABLE`
   - **Step 2**: Fetch driver, check if `status == AVAILABLE`
   - **Step 3**: Check for time conflicts with existing assignments
   - **Step 4**: Begin database transaction
   - **Step 5a**: Create assignment record
   - **Step 5b**: Update vehicle status to `ASSIGNED`
   - **Step 5c**: Update driver status to `ON_DUTY`
   - **Step 6**: Commit transaction
3. **Response**: `201 Created` with assignment JSON

If any step fails, transaction is rolled back and error is returned.

### 9.3 Ingest Telemetry (Real-time Processing)
**Request**: `POST /api/v1/telemetry` with GPS data

1. **API Handler**: Deserializes telemetry data, calls service
2. **Service** (`TelemetryService::ingest_telemetry`):
   - **Step 1**: Persist to PostgreSQL (historical record)
   - **Step 2**: Update Redis cache (latest vehicle status)
   - **Step 3**: Real-time analysis:
     - If `speed > speed_limit` → Create `Alert` (Speeding)
     - If `engine_temp > threshold` → Create `Alert` (Engine Warning)
3. **Response**: `201 Created`

## 10. Security Best Practices

### 10.1 Authentication
- JWT tokens with 24-hour expiry
- Refresh token support (stored in httpOnly cookies)
- Password hashing with Argon2 (configurable work factor)

### 10.2 Authorization
- Role-based access control (RBAC)
- Middleware checks user role before allowing access
- Granular permissions per endpoint

### 10.3 Input Validation
- All user input validated via DTOs
- SQL injection prevention via parameterized queries (SQLx)
- XSS prevention via proper JSON encoding

### 10.4 Data Security
- Passwords hashed with Argon2 (never stored plain text)
- Sensitive data encrypted at rest in database
- HTTPS/TLS enforced for data in transit

### 10.5 Audit Logging
- All financial transactions logged
- User actions tracked (who created/modified/deleted)
- Database triggers for automatic audit trail

## 11. Performance Optimization

### 11.1 Database Optimization
- Indexes on frequently queried columns (id, vin, license_plate, user_id)
- Connection pooling via SQLx (configured pool size)
- Prepared statements (compile-time checked with SQLx)

### 11.2 Caching Strategy
- Redis cache for real-time vehicle status
- Cache frequently accessed reference data (vehicles, drivers)
- TTL-based invalidation (1 hour default)

### 11.3 Async Operations
- All I/O operations are async (Actix-web + Tokio runtime)
- Non-blocking database queries
- Efficient connection reuse

## 12. Future Improvements

### 12.1 Event-Driven Architecture
Replace direct service calls with event bus:
- **Publisher**: `AssignmentService` publishes `AssignmentCreated` event
- **Subscribers**: `VehicleService`, `DriverService`, `NotificationService` listen
- **Benefits**: Loose coupling, async processing, scalability
- **Technologies**: RabbitMQ, Kafka, or internal channels

### 12.2 Background Jobs
- Implement scheduled tasks (maintenance trigger evaluation)
- Use job queue (Redis + tokio-cron or background workers)
- Health check endpoints

### 12.3 Monitoring & Observability
- Prometheus metrics export
- Distributed tracing (OpenTelemetry)
- Structured logging with correlation IDs

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Maintainer**: Backend Team
