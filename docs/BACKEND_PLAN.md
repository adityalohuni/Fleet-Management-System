# Backend Implementation Plan

This document outlines the detailed plan for implementing the backend of the Fleet Management System, incorporating requirements from the MVP and future extensions.

## 1. Technology Stack

*   **Runtime:** Rust (v1.75+)
*   **Framework:** Actix-web (High-performance, actor-based web framework)
*   **Database:** PostgreSQL (v16+)
*   **Database Access:** SQLx (Async, pure Rust SQL crate with compile-time checked queries)
*   **Caching/Queues:** Redis (via `redis` crate, for caching and background jobs)
*   **Authentication:** JWT (via `jsonwebtoken` crate) + Argon2 (for password hashing)
*   **Validation:** `validator` crate
*   **Documentation:** `utoipa` (Auto-generated OpenAPI documentation)
*   **Serialization:** `serde` & `serde_json`

## 2. Database Schema (PostgreSQL + SQLx)

### 2.1 Core MVP Models

#### `User`
*   **id**: UUID (PK)
*   **email**: String (Unique)
*   **passwordHash**: String
*   **role**: Enum (ADMIN, MANAGER, DRIVER, MECHANIC)
*   **createdAt**: DateTime

#### `Vehicle`
*   **id**: UUID (PK)
*   **make**: String
*   **model**: String
*   **year**: Integer
*   **vin**: String (Unique)
*   **licensePlate**: String (Unique)
*   **type**: Enum (TRUCK, VAN, SEDAN)
*   **status**: Enum (AVAILABLE, ASSIGNED, MAINTENANCE, OUT_OF_SERVICE)
*   **currentMileage**: Integer
*   **fuelType**: Enum (DIESEL, GASOLINE, ELECTRIC)
*   **createdAt**: DateTime
*   **updatedAt**: DateTime

#### `Driver`
*   **id**: UUID (PK)
*   **userId**: UUID (FK -> User.id, optional if driver doesn't log in initially)
*   **firstName**: String
*   **lastName**: String
*   **licenseNumber**: String (Unique)
*   **licenseExpiry**: DateTime
*   **status**: Enum (AVAILABLE, ON_DUTY, OFF_DUTY, SICK_LEAVE)
*   **hourlyRate**: Decimal
*   **phone**: String
*   **email**: String

#### `Assignment`
*   **id**: UUID (PK)
*   **vehicleId**: UUID (FK -> Vehicle.id)
*   **driverId**: UUID (FK -> Driver.id)
*   **serviceId**: UUID (FK -> TransportService.id, optional)
*   **startTime**: DateTime
*   **endTime**: DateTime (Nullable)
*   **status**: Enum (SCHEDULED, ACTIVE, COMPLETED, CANCELLED)
*   **startMileage**: Integer
*   **endMileage**: Integer (Nullable)
*   **notes**: Text

#### `TransportService` (The "Job" or "Load")
*   **id**: UUID (PK)
*   **customerId**: UUID (FK -> Customer.id)
*   **origin**: String
*   **destination**: String
*   **loadDetails**: Json (weight, type, dimensions)
*   **agreedPrice**: Decimal
*   **status**: Enum (PENDING, IN_PROGRESS, DELIVERED, INVOICED, PAID)
*   **proofOfDelivery**: String (URL to image/pdf)

#### `MaintenanceRecord`
*   **id**: UUID (PK)
*   **vehicleId**: UUID (FK -> Vehicle.id)
*   **type**: Enum (PREVENTIVE, REPAIR, INSPECTION, ACCIDENT)
*   **date**: DateTime
*   **cost**: Decimal
*   **provider**: String
*   **description**: Text
*   **odometerReading**: Integer

#### `MaintenanceTrigger`
*   **id**: UUID (PK)
*   **vehicleId**: UUID (FK -> Vehicle.id)
*   **name**: String (e.g., "Oil Change")
*   **intervalMileage**: Integer (e.g., 5000)
*   **intervalMonths**: Integer (e.g., 6)
*   **lastPerformedDate**: DateTime
*   **lastPerformedMileage**: Integer
*   **nextDueDate**: DateTime (Calculated)
*   **nextDueMileage**: Integer (Calculated)

### 2.2 Extension Models (Future Proofing)

#### `Customer` (CRM)
*   **id**: UUID (PK)
*   **name**: String
*   **contactPerson**: String
*   **email**: String
*   **phone**: String
*   **address**: String

#### `Rental` (Revenue Diversification)
*   **id**: UUID (PK)
*   **vehicleId**: UUID (FK -> Vehicle.id)
*   **customerId**: UUID (FK -> Customer.id)
*   **startDate**: DateTime
*   **endDate**: DateTime
*   **rateType**: Enum (DAILY, WEEKLY, MONTHLY)
*   **rateAmount**: Decimal
*   **deposit**: Decimal
*   **status**: Enum (RESERVED, ACTIVE, COMPLETED, OVERDUE)

#### `GPSTrack` (IoT/Tracking)
*   **id**: UUID (PK)
*   **vehicleId**: UUID (FK -> Vehicle.id)
*   **timestamp**: DateTime
*   **latitude**: Float
*   **longitude**: Float
*   **speed**: Float
*   **heading**: Float

## 3. API Structure (RESTful)

### 3.1 Authentication Module
*   `POST /auth/login`: Returns JWT.
*   `POST /auth/register`: Create new user (Admin only).
*   `GET /auth/profile`: Get current user info.

### 3.2 Vehicles Module
*   `GET /vehicles`: List with filters (status, type).
*   `POST /vehicles`: Create vehicle.
*   `GET /vehicles/:id`: Details + Maintenance History + Active Assignment.
*   `PATCH /vehicles/:id`: Update details.
*   `DELETE /vehicles/:id`: Soft delete.

### 3.3 Drivers Module
*   `GET /drivers`: List with filters (status, license expiry).
*   `POST /drivers`: Onboard driver.
*   `GET /drivers/:id`: Details + Assignment History.
*   `PATCH /drivers/:id`: Update status/details.

### 3.4 Assignments Module
*   `GET /assignments`: Calendar view/List view.
*   `POST /assignments`: Create assignment.
    *   *Validation*: Check if Vehicle and Driver are AVAILABLE during requested window.
*   `PATCH /assignments/:id/status`: Transition state (SCHEDULED -> ACTIVE -> COMPLETED).
    *   *Logic*: When ACTIVE, set Vehicle/Driver status to ASSIGNED/ON_DUTY. When COMPLETED, prompt for end mileage.

### 3.5 Maintenance Module
*   `GET /maintenance/records`: History log.
*   `POST /maintenance/records`: Log new service.
    *   *Logic*: Update `MaintenanceTrigger` lastPerformed fields.
*   `GET /maintenance/alerts`: List vehicles due for service.
*   `POST /maintenance/triggers`: Configure rules for a vehicle.

### 3.6 Financial Module
*   `GET /financial/dashboard`: Aggregated stats (Revenue, Costs, Profit).
*   `GET /financial/vehicle/:id/profitability`: Specific vehicle P&L.

## 4. Services & Business Logic

### 4.1 `AssignmentService`
*   **Conflict Detection**: Before creating an assignment, query existing assignments for overlap on `vehicleId` and `driverId`.
*   **State Machine**: Handle side effects of status changes.
    *   Start Assignment -> Update Vehicle Status to 'ASSIGNED'.
    *   Complete Assignment -> Update Vehicle Status to 'AVAILABLE', Update Vehicle Mileage.

### 4.2 `MaintenanceService`
*   **Trigger Evaluation**:
    *   Run daily (Cron).
    *   Check: `currentDate >= nextDueDate` OR `currentMileage >= nextDueMileage`.
    *   Create `Notification` if threshold met.

### 4.3 `DashboardService`
*   **Aggregation**: Use SQLx queries with `GROUP BY` for fast reporting.
*   **Caching**: Cache expensive monthly reports in Redis with a 1-hour TTL.

## 5. Infrastructure & Deployment

### 5.1 Local Development
*   **Docker Compose**:
    *   `postgres`: Database.
    *   `redis`: Caching.
    *   `pgadmin` (optional): DB GUI.
*   **Seed Script**: Populate DB with mock vehicles and drivers for UI testing.

### 5.2 CI/CD (GitHub Actions)
*   **Lint & Test**: Run `cargo clippy` and `cargo test` on PR.
*   **Build**: Build Rust binary.
*   **Deploy**: Push Docker image to registry (ECR/Docker Hub).

### 5.3 Cloud (AWS Example)
*   **ECS Fargate**: Run backend container.
*   **RDS Postgres**: Managed database.
*   **ElastiCache**: Managed Redis.
*   **ALB**: Load balancer for HTTPS termination.

## 6. Next Steps
1.  Initialize Rust/Actix-web project.
2.  Set up SQLx migrations based on Section 2.
3.  Implement Auth module.
4.  Build Core CRUD for Vehicles and Drivers.
