# Scalable Database Schema Design

This document outlines the database schema design for the Fleet Management System, focusing on scalability, performance, and future extensibility.

## 1. Architectural Strategy

To ensure scalability and maintainability, we will employ a **Polyglot Persistence** strategy, primarily centered around PostgreSQL but leveraging specific extensions and auxiliary stores for specialized data.

*   **Primary Database:** **PostgreSQL (v16+)**
    *   Used for core relational data (Users, Vehicles, Assignments, Financials).
    *   **PostGIS Extension:** For geospatial data (routes, geofences, current locations).
    *   **TimescaleDB Extension (Optional/Future):** For high-volume time-series data (vehicle telemetry, sensor readings).
    *   **btree_gist Extension:** Required for exclusion constraints on scalar types (UUIDs) combined with ranges.
*   **Caching & Hot Data:** **Redis**
    *   Used for real-time vehicle status, active user sessions, and caching expensive dashboard aggregation queries.
*   **Object Storage:** **S3 Compatible Storage (MinIO/AWS S3)**
    *   Used for storing documents (licenses, proof of delivery images, maintenance receipts).

## 2. Core Relational Schema (PostgreSQL)

### 2.1 Identity & Access Management (IAM)

| Table | Description | Key Columns | Indexes |
| :--- | :--- | :--- | :--- |
| `users` | System users | `id` (UUID), `email`, `password_hash`, `role`, `is_active`, `deleted_at` | `email` (Unique) |
| `roles` | Role definitions | `id`, `name`, `permissions` (JSONB) | |

*Note: We will use a simplified RBAC model where `users.role` links to a predefined set of permissions. Granular `user_permissions` tables are removed for MVP simplicity unless complex custom roles are needed.*

### 2.2 Fleet Assets

| Table | Description | Key Columns | Indexes |
| :--- | :--- | :--- | :--- |
| `vehicles` | Fleet vehicles | `id` (UUID), `vin`, `license_plate`, `make`, `model`, `year`, `status`, `specs` (JSONB), `deleted_at` | `vin`, `license_plate`, `status`, `specs` (GIN) |
| `drivers` | Driver profiles | `id` (UUID), `user_id` (FK), `license_number`, `status`, `deleted_at` | `license_number`, `status` |
| `vehicle_assignments` | Who is driving what | `id`, `vehicle_id`, `driver_id`, `start_time`, `end_time`, `status` | `vehicle_id`, `driver_id`, `status`, `start_time` |

*Note: `current_location` has been moved out of the `drivers` table to avoid high-frequency updates on the profile table. Use Redis or `vehicle_telemetry` for location.*

### 2.3 Operations & Logistics

| Table | Description | Key Columns | Indexes |
| :--- | :--- | :--- | :--- |
| `customers` | Clients | `id`, `name`, `contact_info` (JSONB), `billing_address`, `deleted_at` | `name` |
| `transport_jobs` | High-level jobs | `id`, `customer_id`, `status`, `agreed_price` | `customer_id`, `status` |
| `routes` | Planned paths | `id`, `job_id`, `origin` (Point), `destination` (Point), `waypoints` (LineString) | `job_id` |
| `shipments` | Cargo details | `id`, `job_id`, `weight`, `dimensions`, `type` | `job_id` |

### 2.4 Maintenance & Health

| Table | Description | Key Columns | Indexes |
| :--- | :--- | :--- | :--- |
| `maintenance_records` | Service history | `id`, `vehicle_id`, `type`, `cost`, `date`, `provider` | `vehicle_id`, `date` |
| `maintenance_schedules` | Recurring rules | `id`, `vehicle_type`, `interval_km`, `interval_months` | |
| `alerts` | System notifications | `id`, `entity_id`, `type`, `severity`, `is_resolved` | `is_resolved`, `severity` |

## 3. High-Volume Telemetry (Time-Series)

For real-time tracking and historical analysis, we need to store high-frequency data points. Standard relational tables will bloat quickly.

**Strategy:** Use **Table Partitioning** (native PostgreSQL) or **TimescaleDB** hypertables.

### `vehicle_telemetry`
*   **Partition Key:** `timestamp` (Daily or Weekly partitions)
*   **Columns:**
    *   `time` (TIMESTAMPTZ) - *Primary partitioning key*
    *   `vehicle_id` (UUID)
    *   `location` (GEOMETRY(POINT, 4326))
    *   `speed` (FLOAT)
    *   `fuel_level` (FLOAT)
    *   `engine_status` (JSONB) - For OBD-II codes, temperature, RPM.
*   **Retention Policy:**
    *   Raw data: 30 days.
    *   Downsampled (1-hour avg): 1 year.
    *   Archived (Daily avg): Indefinite.

## 4. Scaling & Optimization Techniques

### 4.1 Database Partitioning
*   **Assignments & Jobs:** Partition by `created_at` (Yearly) to keep the active dataset small.
*   **Audit Logs:** Partition by `created_at` (Monthly).

### 4.2 Indexing Strategy
*   **B-Tree:** Standard for IDs, foreign keys, and status columns.
*   **GIN (Generalized Inverted Index):** For querying JSONB columns (e.g., finding all vehicles with `specs->'transmission' = 'automatic'`).
*   **GiST (Generalized Search Tree):** For geospatial queries (e.g., "Find all available drivers within 50km of Warehouse A").

### 4.3 Read/Write Splitting (Future)
*   **Primary Node:** Handles all `INSERT`, `UPDATE`, `DELETE` operations.
*   **Read Replicas:** Handle heavy `SELECT` queries for reporting and dashboards.
*   **Application Logic:** The Rust backend will configure the connection pool to route read-only transactions to replicas.

## 5. Redis Data Structures

| Key Pattern | Type | Purpose | TTL |
| :--- | :--- | :--- | :--- |
| `vehicle:{id}:status` | Hash | Real-time snapshot (speed, lat, long, driver) | 5 mins |
| `driver:{id}:session` | String | JWT blacklist or session data | JWT Exp |
| `dashboard:stats:daily` | String | Cached JSON of expensive aggregation queries | 1 hour |
| `geofence:{id}` | Geo | Storing active geofences for quick lookup | Indefinite |

## 7. Query Analysis & Optimization Strategy

To ensure high performance, we have analyzed the critical access patterns and optimized the schema accordingly.

### 7.1 Critical Query Patterns

#### A. "Find Available Vehicles/Drivers for a Time Range"
*   **Context:** When creating a new assignment, the system must ensure the resource isn't already booked.
*   **Challenge:** Checking for time overlaps (`start_A <= end_B AND end_A >= start_B`) is error-prone and slow with standard columns.
*   **Optimization:** Use PostgreSQL **Range Types** (`tstzrange`) and **GiST Indexes**.
    *   **Schema Change:** Add `duration tstzrange` to `vehicle_assignments`.
    *   **Constraint:** `EXCLUDE USING GIST (vehicle_id WITH =, duration WITH &&)` prevents overlapping assignments at the database level.

#### B. "Dashboard Aggregations" (High Frequency)
*   **Context:** The dashboard loads "Total Revenue", "Active Vehicles", and "Maintenance Costs" on every page load.
*   **Challenge:** `COUNT(*)` and `SUM()` on large tables are slow.
*   **Optimization:**
    1.  **Redis Caching:** Cache the result of these queries for 5-10 minutes.
    2.  **Materialized Views:** For complex financial reports (e.g., "Monthly Profitability per Vehicle"), create a view that refreshes nightly.
        ```sql
        CREATE MATERIALIZED VIEW monthly_vehicle_stats AS
        SELECT vehicle_id, date_trunc('month', date) as month, SUM(cost) as total_cost
        FROM maintenance_records
        GROUP BY 1, 2;
        ```

#### C. "Geospatial Search" (Driver Allocation)
*   **Context:** "Find the nearest available driver to the pickup point."
*   **Optimization:** PostGIS `ST_DWithin` queries using GiST indexes on `drivers.current_location`.

### 7.2 Refined Schema Definitions (Optimized)

#### `vehicle_assignments` (Scheduling Optimized)
```sql
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL,
    -- Prevent double booking a vehicle using a functional index on the range
    EXCLUDE USING GIST (
        vehicle_id WITH =, 
        tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status = 'ACTIVE')
);
```

#### `vehicles` (Filter Optimized)
*   **Indexes:**
    *   `CREATE INDEX idx_vehicles_status_type ON vehicles(status, type);` (Covers the most common filter combo).
    *   `CREATE INDEX idx_vehicles_specs ON vehicles USING GIN (specs);` (Allows fast searching like `specs @> '{"fuel": "diesel"}'`).

#### `maintenance_triggers` (Alert Optimized)
*   **Computed Columns:** Use generated columns for "Next Due" logic if possible, or partial indexes.
*   **Index:** `CREATE INDEX idx_maintenance_overdue ON maintenance_triggers (next_due_date) WHERE next_due_date < NOW();`
    *   *Why?* This index is tiny (only contains overdue items) and makes the "Show Alerts" query instant.
