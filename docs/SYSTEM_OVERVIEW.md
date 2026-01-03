# Fleet Management System - System Overview

## 1. Business Context

### 1.1 Company Profile
The Fleet Management System is designed for a transport-focused business operating as a third-party logistics provider. The company:
- Owns and operates a fleet of commercial vehicles
- Employs hourly-wage drivers
- Provides load carrier services to clients
- Requires efficient fleet optimization and cost management

### 1.2 Primary Users
- **Fleet Managers**: Overall fleet oversight and optimization
- **Operations Staff**: Day-to-day assignment management
- **Maintenance Teams**: Vehicle maintenance tracking
- **Drivers**: Job assignments and vehicle operations (future mobile app)

### 1.3 MVP Scope
- **Timeline**: 6-8 weeks for initial deployment
- **Core Focus**: Transport service operations
- **Key Capabilities**: Vehicle tracking, driver management, service logging, automated maintenance triggers

## 2. Strategic Vision & Core Principles

### 2.1 MVP Strategic Focus
1. **Operational Efficiency**: Streamline vehicle assignments and service tracking
2. **Preventive Maintenance**: Automated triggers to reduce downtime
3. **Financial Visibility**: Track service revenue and maintenance costs per vehicle
4. **Scalability**: Design with extension points for future features

### 2.2 Long-term Vision
Transform the basic management system into a comprehensive fleet optimization platform with:
- Real-time GPS tracking and geofencing
- Intelligent route optimization
- Multi-revenue stream management (transport + rentals)
- Advanced business intelligence and predictive analytics

## 3. System Architecture

### 3.1 Architecture Pattern
The system follows **Clean Layered Architecture** (N-Tier) with strict separation of concerns:

```
┌─────────────────────────────────────┐
│   Frontend (React + TypeScript)     │  ← User interface
└──────────────┬──────────────────────┘
               │ REST API (JSON)
┌──────────────▼──────────────────────┐
│   API Layer (Actix-web Routes)      │  ← HTTP handlers, DTOs, validation
├─────────────────────────────────────┤
│   Service Layer                      │  ← Business logic, orchestration
├─────────────────────────────────────┤
│   Repository Layer                   │  ← Data access, SQL queries
├─────────────────────────────────────┤
│   Data Stores                        │
│   ├─ PostgreSQL (Primary DB)        │  ← Persistent data
│   ├─ Redis (Cache & Queues)         │  ← Real-time data
│   └─ S3 (File Storage)              │  ← Documents, images
└─────────────────────────────────────┘
```

### 3.2 Architectural Principles
- **Unidirectional Dependency Flow**: API → Service → Repository → Database
- **Separation of Concerns**: Each layer has single responsibility
- **Dependency Injection**: Actix-web's `web::Data` for state management
- **Error Handling**: Centralized `AppError` enum with automatic HTTP conversion
- **Testability**: Each layer can be tested independently with mocks

### 3.3 Directory Structure
```
backend/src/
├── api/                 # API Layer (HTTP handlers)
│   ├── v1/             # Versioned endpoints
│   ├── dto/            # Request/Response DTOs
│   └── middleware/     # Auth, CORS, logging
├── services/           # Business Logic Layer
├── repositories/       # Data Access Layer
│   ├── postgres/       # SQLx implementations
│   └── redis/          # Redis cache
├── models/             # Domain entities
├── config/             # Configuration
├── error.rs            # Centralized errors
└── main.rs             # Application entry

frontend/src/
├── components/         # React components
│   ├── pages/         # Page components
│   └── ui/            # Reusable UI components
├── client/            # Generated API client
├── services/          # Frontend services
├── hooks/             # Custom React hooks
└── types/             # TypeScript types
```

## 4. Technology Stack

### 4.1 Backend
- **Runtime**: Rust 1.75+
- **Web Framework**: Actix-web (high-performance, actor-based)
- **Database ORM**: SQLx (async, compile-time checked queries)
- **Authentication**: JWT (`jsonwebtoken`) + Argon2 (password hashing)
- **Validation**: `validator` crate
- **API Documentation**: `utoipa` (auto-generated OpenAPI/Swagger)
- **Serialization**: `serde` & `serde_json`

### 4.2 Frontend
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (shadcn/ui style)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **State Management**: TanStack Query (React Query)
- **API Client**: Generated from OpenAPI spec

### 4.3 Infrastructure
- **Database**: PostgreSQL 16+
- **Caching**: Redis
- **File Storage**: AWS S3 (or compatible)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

### 4.4 Deployment Options
- **AWS**: ECS Fargate, RDS PostgreSQL, ElastiCache, ALB, S3
- **Supabase**: Managed PostgreSQL with built-in auth (fast MVP setup)
- **Self-hosted**: Docker Compose on VPS

## 5. Core Data Models

### 5.1 User Management
**User**
- `id` (UUID, PK)
- `email` (unique, indexed)
- `password_hash` (Argon2)
- `role` (ADMIN | MANAGER | DRIVER | MECHANIC)
- `created_at`, `updated_at`, `deleted_at` (soft delete)

### 5.2 Fleet Management
**Vehicle**
- `id` (UUID, PK)
- `make`, `model`, `year`
- `vin` (unique), `license_plate` (unique)
- `type` (TRUCK | VAN | SEDAN)
- `status` (AVAILABLE | ASSIGNED | MAINTENANCE | OUT_OF_SERVICE)
- `current_mileage`, `fuel_type`
- `created_at`, `updated_at`, `deleted_at`

**Driver**
- `id` (UUID, PK)
- `user_id` (FK → User.id, nullable)
- `first_name`, `last_name`
- `license_number` (unique), `license_expiry`
- `status` (AVAILABLE | ON_DUTY | OFF_DUTY | SICK_LEAVE)
- `hourly_rate` (Decimal)
- `phone`, `email`
- `created_at`, `updated_at`, `deleted_at`

### 5.3 Operations
**Assignment** (Vehicle + Driver pairing)
- `id` (UUID, PK)
- `vehicle_id` (FK → Vehicle.id)
- `driver_id` (FK → Driver.id)
- `service_id` (FK → TransportService.id, nullable)
- `start_time`, `end_time` (nullable until completed)
- `status` (SCHEDULED | ACTIVE | COMPLETED | CANCELLED)
- `start_mileage`, `end_mileage` (nullable)
- `notes` (text)

**TransportService** (Revenue-generating jobs)
- `id` (UUID, PK)
- `customer_id` (FK → Customer.id)
- `origin`, `destination`
- `load_details` (JSON: weight, type, dimensions)
- `agreed_price` (Decimal)
- `status` (PENDING | IN_PROGRESS | DELIVERED | INVOICED | PAID)
- `proof_of_delivery` (URL or text)

### 5.4 Maintenance
**MaintenanceRecord**
- `id` (UUID, PK)
- `vehicle_id` (FK → Vehicle.id)
- `type` (PREVENTIVE | REPAIR | INSPECTION | ACCIDENT)
- `date`, `cost` (Decimal), `provider`
- `description` (text), `odometer_reading`

**MaintenanceTrigger** (Automated scheduling rules)
- `id` (UUID, PK)
- `vehicle_id` (FK → Vehicle.id)
- `name` (e.g., "Oil Change")
- `interval_mileage` (e.g., 5000 km)
- `interval_months` (e.g., 6 months)
- `last_performed_date`, `last_performed_mileage`
- `next_due_date`, `next_due_mileage` (calculated)

## 6. Core Modules & Features

### 6.1 Vehicle Management Module
**Purpose**: Central registry and real-time status tracking

**Features**:
- Complete vehicle registry (make, model, year, VIN, registration)
- Real-time status tracking (Available, Assigned, Maintenance, Out of Service)
- Manual mileage logging after service completion
- Vehicle documentation storage (insurance, registration PDFs)
- Utilization tracking (% time assigned)

**Business Logic**:
- Status-based assignment rules (block vehicles in maintenance)
- Warning flags for overdue maintenance
- Soft delete for historical tracking

### 6.2 Driver Management Module
**Purpose**: Workforce management and availability tracking

**Features**:
- Driver profiles with license details
- License expiry alerts (30/60/90 day warnings)
- Hourly wage rate configuration
- Employment status tracking
- Driver availability management

**Business Logic**:
- Prevent assignment of unavailable drivers
- Track driver hours for cost allocation
- Automated license expiry notifications

### 6.3 Assignment System
**Purpose**: Link vehicles, drivers, and services for operational tracking

**Workflow**:
1. Service request received
2. Check vehicle and driver availability
3. Create assignment and update entity statuses
4. Track service execution
5. Complete assignment and log final mileage
6. Release vehicle and driver back to available pool

**Features**:
- Conflict detection (prevent double-booking)
- Assignment duration tracking
- Status transitions (Scheduled → Active → Completed)
- Link to transport service details
- Notes and special instructions

### 6.4 Transport Service Tracking
**Purpose**: Record revenue-generating transport operations

**Features**:
- Client/customer information
- Service details (origin, destination, load type, weight)
- Service fee tracking
- Distance traveled (manual or GPS integration)
- Proof of delivery (timestamp, digital signature)
- Invoice generation

**Business Logic**:
- Calculate service profitability (revenue - costs)
- Track payment status
- Link to specific assignment

### 6.5 Maintenance Trigger Engine
**Purpose**: Automated preventive maintenance scheduling

**Trigger Types**:
- **Mileage-based**: Service every X kilometers (e.g., 10,000 km)
- **Time-based**: Service every X months (e.g., 6 months)
- **Combined**: Whichever comes first

**Features**:
- Daily scheduled job checks all triggers
- Alert thresholds (e.g., 1000 km before due, 2 weeks before due)
- Status flags: OK, Due Soon, Overdue
- Automatic trigger reset after service completion

**Alert Levels**:
- **Green**: >1000km and >30 days remaining
- **Yellow**: <1000km or <30 days remaining
- **Red**: Overdue

### 6.6 Maintenance Records
**Purpose**: Track all maintenance activities and costs

**Features**:
- Complete maintenance history per vehicle
- Cost tracking by service type
- Vendor/provider management
- Automatic odometer recording
- Cost aggregation for profitability analysis

### 6.7 Financial Dashboard
**Purpose**: Track profitability and costs

**Key Metrics**:
- Revenue per vehicle per month
- Maintenance costs per vehicle
- Driver cost allocation (hourly rate × hours worked)
- Service profitability (revenue - maintenance - driver costs)
- Utilization rates

**Reports**:
- Monthly profitability by vehicle
- Maintenance cost trends
- High-maintenance vehicle identification
- ROI per vehicle

## 7. API Design

### 7.1 Authentication & Authorization
**Authentication**: `/auth`
- `POST /auth/login` → Returns JWT token
- `POST /auth/register` → Create user (Admin only)
- `GET /auth/profile` → Current user info

**Authorization**: Role-based access control (RBAC)
- **ADMIN**: Full system access
- **MANAGER**: Operations and reporting
- **DRIVER**: View own assignments
- **MECHANIC**: Maintenance management

### 7.2 Core Endpoints

**Vehicles**: `/api/vehicles`
- `GET /vehicles` - List with filters (status, type, pagination)
- `POST /vehicles` - Create new vehicle
- `GET /vehicles/:id` - Details + maintenance history + active assignment
- `PATCH /vehicles/:id` - Update details
- `DELETE /vehicles/:id` - Soft delete

**Drivers**: `/api/drivers`
- `GET /drivers` - List with filters (status, license expiry)
- `POST /drivers` - Onboard new driver
- `GET /drivers/:id` - Details + assignment history
- `PATCH /drivers/:id` - Update status/details

**Assignments**: `/api/assignments`
- `GET /assignments` - List with filters (date range, status)
- `POST /assignments` - Create assignment (validates availability)
- `GET /assignments/:id` - Assignment details
- `PATCH /assignments/:id/status` - Update status (state machine)

**Maintenance**: `/api/maintenance`
- `GET /maintenance/records` - Maintenance history
- `POST /maintenance/records` - Log service (updates triggers)
- `GET /maintenance/alerts` - Due/overdue vehicles
- `POST /maintenance/triggers` - Configure trigger rules

**Financial**: `/api/financial`
- `GET /financial/dashboard` - Aggregated stats
- `GET /financial/vehicle/:id/profitability` - Vehicle P&L

### 7.3 API Documentation
- **Swagger UI**: `http://localhost:8080/swagger-ui/`
- **OpenAPI Spec**: `http://localhost:8080/api-docs/openapi.json`
- Auto-generated from code using `utoipa` attributes

## 8. Critical Business Logic

### 8.1 Assignment Conflict Detection
**Rule**: A vehicle or driver cannot have overlapping active assignments

**Implementation**:
```
Before creating assignment:
1. Check if vehicle has ACTIVE assignment for time period
2. Check if driver has ACTIVE assignment for time period
3. If conflict found → Return 400 Bad Request
4. Else → Create assignment + Update statuses
```

### 8.2 Assignment State Machine
**Valid Transitions**:
- `SCHEDULED` → `ACTIVE` (driver starts job)
- `ACTIVE` → `COMPLETED` (driver completes job, logs end mileage)
- `SCHEDULED` → `CANCELLED` (assignment cancelled before start)
- `ACTIVE` → `CANCELLED` (emergency cancellation)

**Side Effects**:
- `SCHEDULED → ACTIVE`: Update vehicle to ASSIGNED, driver to ON_DUTY
- `ACTIVE → COMPLETED`: Update vehicle to AVAILABLE, driver to AVAILABLE
- `CANCELLED`: Revert vehicle and driver to AVAILABLE

### 8.3 Maintenance Trigger Evaluation
**Daily Cron Job** (runs at 2:00 AM):
```
For each vehicle:
  For each maintenance trigger:
    Calculate days_since_last = today - last_performed_date
    Calculate km_since_last = current_mileage - last_performed_mileage
    
    If (days_since_last >= interval_months * 30) OR 
       (km_since_last >= interval_mileage):
      Create ALERT with severity RED (Overdue)
    
    Else If (days_since_last >= interval_months * 30 - 14) OR 
            (km_since_last >= interval_mileage - 1000):
      Create ALERT with severity YELLOW (Due Soon)
```

### 8.4 Cost Allocation for Profitability
**Formula**:
```
Service Profit = Service Revenue 
               - Direct Maintenance Costs (during service period)
               - Driver Costs (hourly_rate × assignment_duration_hours)
```

## 9. Future Extensions Roadmap

### Phase 1: Enhanced Operations (Months 3-5)
- **GPS Tracking Integration**: Real-time location, automated mileage, geofencing
- **Route Optimization**: 15-30% fuel savings with traffic-aware routing
- **Advanced Maintenance**: Predictive maintenance using ML, vendor portal

### Phase 2: Revenue Diversification (Months 6-8)
- **Vehicle Rental Management**: New revenue stream (bare vehicle or with driver)
- **Rental Features**: Customer portal, pricing engine, check-in/out inspections
- **Multi-Revenue Analytics**: Optimize allocation between transport and rental

### Phase 3: Advanced Intelligence (Months 9-12)
- **Driver Performance Analytics**: Safety scores, fuel efficiency ratings
- **Client CRM**: Service history, volume-based pricing, customer portal
- **Fuel Management**: Fuel card integration, consumption tracking
- **Mobile App for Drivers**: Digital POD, inspection forms, assignment notifications

### Phase 4: Integration & Automation (Month 12+)
- **Accounting Integration**: QuickBooks/Xero sync
- **IoT Sensors**: Engine diagnostics, cargo sensors, tire pressure monitoring
- **Advanced BI**: Predictive analytics, demand forecasting, what-if scenarios
- **Insurance Claims**: Incident reporting and claim tracking

## 10. Success Metrics

### 10.1 Operational KPIs
- **Vehicle Utilization**: Target 75%+ (assigned time / total time)
- **Maintenance Compliance**: 100% services completed within trigger window
- **Vehicle Downtime**: Reduce by 30%
- **On-Time Delivery Rate**: 95%+
- **Assignment Creation Time**: Reduce from 15 min to 3 min

### 10.2 Financial KPIs
- **Revenue per Vehicle per Month**: Track trend
- **Maintenance Cost per Kilometer**: Reduce by 20%
- **Profit Margin per Vehicle**: Improve by 15-25%
- **Cost per Service**: Reduce by 10-15%

### 10.3 Technology KPIs
- **System Uptime**: 99.5%+
- **User Adoption**: 90%+ within 3 months
- **API Response Time**: <200ms for 95% of requests
- **Data Accuracy**: 95%+ (GPS vs manual entry)

## 11. Security & Compliance

### 11.1 Authentication & Authorization
- JWT tokens with 24-hour expiry
- Refresh token support
- Role-based access control (RBAC)
- Password requirements: min 8 chars, uppercase, lowercase, number

### 11.2 Data Security
- Passwords hashed with Argon2
- Data encryption at rest (PostgreSQL encryption)
- HTTPS/TLS for data in transit
- Sensitive data (SSN, license numbers) encrypted in database

### 11.3 Audit & Compliance
- Audit logging for all financial transactions
- User action logging (who created/modified/deleted)
- GDPR compliance for driver and customer data
- Data retention policies (soft deletes, historical records)

## 12. Expected ROI

### Year 1 (MVP + Phase 1)
- **Operational Efficiency**: $50K-$100K in time savings
- **Reduced Downtime**: $30K-$60K from preventive maintenance
- **Fuel Savings**: $20K-$40K from optimized routing
- **Total ROI**: 50-100% of implementation cost

### Year 2 (Phase 2 + Phase 3)
- **New Rental Revenue**: $150K-$300K
- **Continued Operational Savings**: $120K-$180K
- **Improved Utilization**: $80K-$120K from better scheduling
- **Cumulative ROI**: 200-300% of implementation cost

## 13. Implementation Timeline

### Weeks 1-2: Foundation
- Project setup, database schema, authentication

### Weeks 3-4: Core CRUD
- Vehicles, Drivers, Users management

### Weeks 5-6: Assignment System
- Assignment creation, conflict detection, state machine

### Weeks 7-8: Maintenance & Financial
- Maintenance triggers, financial dashboard, MVP launch

### Post-MVP: Iterative Enhancements
- User feedback incorporation
- Performance optimization
- Phase 1 feature development

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Maintainer**: Development Team
