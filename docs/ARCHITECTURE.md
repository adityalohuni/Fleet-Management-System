# Fleet Management System Architecture

## 1. Overview
This document outlines the architecture for the Fleet Management System. The frontend is currently a React application (Vite) with a mock implementation. This document defines the requirements for the backend, database, and infrastructure to make the application fully functional.

## 2. Current UI & Frontend Structure
The frontend is built using:
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Components:** Custom UI components (shadcn/ui style)
- **Visualization:** Recharts
- **Icons:** Lucide React

### Key Pages & Features
1.  **Dashboard:**
    -   **Overview:** KPI cards (Total Vehicles, Active Drivers), Utilization charts, Maintenance costs, Profitability tables.
    -   **Data Needs:** Aggregated metrics, recent assignments, active alerts.
2.  **Vehicles:**
    -   **List View:** Filterable list of vehicles with status, mileage, and utilization.
    -   **Details:** Maintenance history for specific vehicles.
    -   **Data Needs:** CRUD for vehicles, maintenance logs.
3.  **Drivers:**
    -   **List View:** Driver profiles, license status, availability, wage rates.
    -   **Logic:** License expiry alerts.
    -   **Data Needs:** CRUD for drivers, assignment history.
4.  **Assignments:**
    -   **Management:** Assign drivers to vehicles/routes.
    -   **Tracking:** Status (Scheduled, Active, Completed), progress tracking.
    -   **Data Needs:** Complex relationships between Drivers, Vehicles, and Services.
5.  **Maintenance:**
    -   **Tracking:** Service records, costs, providers.
    -   **Alerts:** Due/Overdue maintenance based on date or mileage.
    -   **Data Needs:** Maintenance schedules, cost aggregation.
6.  **Financial:**
    -   **Analysis:** Revenue vs. Costs, Profitability per vehicle.
    -   **Data Needs:** Aggregated financial data from assignments and maintenance.

## 3. Backend Requirements

### 3.1. API Endpoints (RESTful)

#### Vehicles
-   `GET /api/vehicles` - List all vehicles (with filters).
-   `GET /api/vehicles/:id` - Get vehicle details.
-   `POST /api/vehicles` - Add a new vehicle.
-   `PUT /api/vehicles/:id` - Update vehicle details.
-   `DELETE /api/vehicles/:id` - Remove a vehicle.

#### Drivers
-   `GET /api/drivers` - List all drivers.
-   `GET /api/drivers/:id` - Get driver details.
-   `POST /api/drivers` - Register a new driver.
-   `PUT /api/drivers/:id` - Update driver profile.

#### Assignments
-   `GET /api/assignments` - List assignments.
-   `POST /api/assignments` - Create a new assignment.
-   `PATCH /api/assignments/:id/status` - Update assignment status (e.g., Start, Complete).

#### Maintenance
-   `GET /api/maintenance` - List maintenance records.
-   `POST /api/maintenance` - Log a maintenance event.
-   `GET /api/maintenance/alerts` - Get due/overdue alerts.

#### Financial
-   `GET /api/financial/summary` - Get monthly revenue/cost summary.
-   `GET /api/financial/vehicle-profitability` - Get profitability ranking.

### 3.2. Data Models (Schema Design)

**Vehicle**
```json
{
  "id": "UUID",
  "model": "String",
  "type": "Enum(Truck, Van)",
  "status": "Enum(Available, Assigned, In Maintenance)",
  "mileage": "Integer",
  "last_service_date": "Date",
  "license_plate": "String"
}
```

**Driver**
```json
{
  "id": "UUID",
  "name": "String",
  "license_number": "String",
  "license_expiry": "Date",
  "status": "Enum(Available, On Duty, Off Duty)",
  "wage_rate": "Decimal",
  "contact_info": "Json"
}
```

**Assignment**
```json
{
  "id": "UUID",
  "vehicle_id": "UUID (FK)",
  "driver_id": "UUID (FK)",
  "start_time": "DateTime",
  "end_time": "DateTime",
  "status": "Enum(Scheduled, Active, Completed, Cancelled)",
  "route_details": "Json",
  "revenue_generated": "Decimal"
}
```

**MaintenanceRecord**
```json
{
  "id": "UUID",
  "vehicle_id": "UUID (FK)",
  "date": "Date",
  "type": "String",
  "cost": "Decimal",
  "provider": "String",
  "notes": "Text"
}
```

## 4. Architecture & Technology Stack

### 4.1. Core Components
-   **Database:** **PostgreSQL**. Relational data is essential for the interconnected nature of vehicles, drivers, and assignments.
-   **Backend Framework:** **Node.js** with **NestJS** or **Express**.
    -   *NestJS* is recommended for its structured architecture (Modules, Services, Controllers) which scales well.
-   **ORM:** **Prisma** or **TypeORM** for type-safe database interactions.

### 4.2. Middleware & Services
-   **Authentication:** JWT-based auth. Middleware to protect routes.
-   **Validation:** Zod or Joi for validating request bodies (e.g., ensuring end date is after start date).
-   **Scheduler Service:** A background job (e.g., BullMQ or Cron) to check for:
    -   License expiries.
    -   Maintenance due dates.
    -   Generating periodic financial reports.
-   **Real-time Service:** Socket.io for pushing updates to the dashboard (e.g., when a driver goes "On Duty" or a vehicle status changes).

## 5. Deployment Options

### Option A: Supabase (Recommended for Speed)
-   **Database:** Managed PostgreSQL.
-   **Auth:** Built-in Authentication.
-   **Real-time:** Built-in subscription capabilities.
-   **Pros:** Extremely fast setup, handles infrastructure.
-   **Cons:** Vendor lock-in.

### Option B: Firebase
-   **Database:** Firestore (NoSQL). *Note: Might require careful modeling for relational data.*
-   **Auth:** Firebase Auth.
-   **Pros:** Great real-time features, easy integration.
-   **Cons:** Complex queries can be difficult in NoSQL.

### Option C: AWS (Recommended for Scale)
-   **Compute:** AWS ECS (Fargate) or EC2 for the Node.js backend.
-   **Database:** Amazon RDS for PostgreSQL.
-   **Storage:** S3 for storing vehicle images or documents.
-   **Pros:** Full control, industry standard, highly scalable.
-   **Cons:** Higher operational complexity.

## 6. Non-Functional Requirements

### 6.1. User Experience (UX)
-   **Responsiveness:** The UI must remain responsive on tablets (for drivers) and desktops (for managers).
-   **Feedback:** Immediate visual feedback for actions (e.g., "Saving...", "Updated successfully").
-   **Optimistic UI:** Update the UI immediately while the backend processes the request.

### 6.2. Scalability & Performance
-   **Caching:** Use Redis to cache expensive dashboard aggregation queries (e.g., monthly financial summaries).
-   **Indexing:** Ensure database columns used in filters (status, date ranges) are indexed.
-   **Pagination:** All list endpoints must support pagination to handle growing datasets.

### 6.3. Latency
-   **CDN:** Serve static assets (frontend build) via a CDN (e.g., Cloudfront, Vercel Edge).
-   **Database Optimization:** Keep queries efficient. Avoid N+1 problems using ORM features (e.g., `include` in Prisma).

### 6.4. Delivery & Development
-   **CI/CD:** GitHub Actions to run tests and deploy automatically on merge to `main`.
-   **Linting/Formatting:** ESLint and Prettier to maintain code quality.
-   **Testing:**
    -   Unit tests for Services (Jest).
    -   Integration tests for API endpoints.
