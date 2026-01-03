# API Layer Documentation

The API Layer (Presentation Layer) is the entry point for the Fleet Management System backend. It is responsible for handling HTTP requests, validating input, invoking the appropriate Service Layer logic, and formatting HTTP responses.

## Directory Structure

The API layer is organized by resource and versioning:

```text
backend/src/api/
├── mod.rs               # Module definitions and configuration
├── dto/                 # Data Transfer Objects (Request/Response structs)
│   ├── mod.rs
│   ├── auth_dto.rs
│   ├── vehicle_dto.rs
│   ├── driver_dto.rs
│   └── ...
├── v1/                  # Version 1 API Handlers
│   ├── mod.rs
│   ├── auth.rs
│   ├── vehicles.rs
│   ├── drivers.rs
│   ├── assignments.rs
│   ├── maintenance.rs
│   └── ...
└── middleware/          # Custom Middleware (Auth, Logging)
    ├── mod.rs
    └── auth_middleware.rs
```

## Responsibilities

1.  **Routing**: Mapping HTTP methods and paths to specific handler functions using `actix-web`.
2.  **Input Validation**:
    *   Deserializing JSON bodies and Query parameters into DTOs.
    *   Validating DTOs using the `validator` crate (e.g., checking email format, string length).
3.  **Authentication & Authorization**:
    *   Extracting JWTs from headers.
    *   Verifying user identity and permissions via Middleware.
4.  **Service Invocation**: Calling methods on injected Services.
5.  **Response Formatting**:
    *   Mapping Service results (`Result<T, AppError>`) to HTTP responses (`HttpResponse`).
    *   Serializing success data to JSON.
    *   Mapping `AppError` to appropriate HTTP status codes (400, 401, 404, 500).
6.  **Documentation**: Defining OpenAPI (Swagger) specs using `utoipa` attributes.

## API Documentation

The API documentation is automatically generated from the code using `utoipa` and served via `utoipa-swagger-ui`.

### Accessing the Documentation

When the backend server is running (default: `http://127.0.0.1:8080`), you can access the interactive API documentation at:

*   **Swagger UI**: `http://127.0.0.1:8080/swagger-ui/`
*   **OpenAPI JSON Spec**: `http://127.0.0.1:8080/api-docs/openapi.json`

### Authentication in Swagger UI

The API uses JWT Bearer authentication. To test protected endpoints in Swagger UI:

1.  Call the `/auth/login` endpoint to get a token.
2.  Click the "Authorize" button at the top of the Swagger UI page.
3.  Enter the token in the format: `Bearer <your_token>`.
4.  Click "Authorize" and then "Close".
5.  Now you can execute protected requests.

## Key Components

### 1. Handlers (Controllers)
Handlers are async functions that take request data (Path, Query, Json) and application state (`web::Data`), and return an `impl Responder`.

**Example:**
```rust
#[utoipa::path(
    get,
    path = "/api/v1/vehicles/{id}",
    responses(
        (status = 200, description = "Vehicle found", body = VehicleResponseDto),
        (status = 404, description = "Vehicle not found")
    )
)]
pub async fn get_vehicle(
    path: web::Path<Uuid>,
    service: web::Data<dyn VehicleServiceTrait>,
) -> Result<HttpResponse, AppError> {
    let vehicle = service.get_vehicle(path.into_inner()).await?;
    Ok(HttpResponse::Ok().json(vehicle))
}
```

### 2. Data Transfer Objects (DTOs)
DTOs define the contract between the client and the server. They are distinct from Domain Models to allow for independent evolution.

*   **Request DTOs**: Implement `Deserialize` and `Validate`.
    *   *Note:* For integration testing using `actix_web::test::TestRequest::set_json`, Request DTOs must also implement `Serialize`.
*   **Response DTOs**: Implement `Serialize`.
    *   *Note:* For integration testing using `actix_web::test::read_body_json`, Response DTOs must also implement `Deserialize`.

**Example (`CreateVehicleDto`):**
```rust
#[derive(Serialize, Deserialize, Validate, ToSchema)]
pub struct CreateVehicleDto {
    #[validate(length(min = 1))]
    pub model: String,
    #[validate(length(min = 1))]
    pub license_plate: String,
    // ...
}
```

### 3. Middleware
*   **AuthMiddleware**: Intercepts requests, validates the `Authorization: Bearer <token>` header, and injects the `UserId` into the request extensions.
*   **Logger**: Standard Actix logger for request tracing.
*   **CORS**: Configured to allow requests from the frontend.

## API Documentation (OpenAPI/Swagger)

We use `utoipa` to generate OpenAPI v3 documentation from code attributes.
*   **UI Access**: The Swagger UI is available at `/swagger-ui/` when running the server.
*   **Schema Derivation**: DTOs derive `ToSchema` to automatically generate JSON schemas.

## Error Handling

The API layer relies on the centralized `AppError` enum.
*   Handlers return `Result<HttpResponse, AppError>`.
*   `AppError` implements `ResponseError`, allowing Actix to automatically convert it to an HTTP response.

| AppError Variant | HTTP Status | Description |
| :--- | :--- | :--- |
| `ValidationError` | 400 Bad Request | Input validation failed |
| `BadRequest` | 400 Bad Request | Business rule violation |
| `Unauthorized` | 401 Unauthorized | Missing or invalid token |
| `Forbidden` | 403 Forbidden | Insufficient permissions |
| `NotFound` | 404 Not Found | Resource not found |
| `DatabaseError` | 500 Internal Server Error | DB connectivity or query issues |
| `InternalServerError` | 500 Internal Server Error | Unexpected errors |

## Dependency Injection

Services are injected into handlers using `web::Data<T>`.
*   In `main.rs`, we wrap services in `Arc` (or `Box` depending on trait usage) and register them with `App::new().app_data(...)`.
*   Handlers specify the trait type they need (e.g., `web::Data<dyn VehicleServiceTrait>`).

## Module Exposure
To ensure that the API layer components (DTOs, Handlers) are accessible for integration tests (which reside in the `tests/` directory), the `api` module must be publicly exposed in `src/lib.rs`:

```rust
// src/lib.rs
pub mod api;
```
