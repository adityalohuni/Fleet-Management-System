-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Update Vehicles Table
ALTER TABLE vehicles ADD COLUMN specs JSONB;
ALTER TABLE vehicles ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_vehicles_specs ON vehicles USING GIN (specs);
CREATE INDEX idx_vehicles_status_type ON vehicles(status, type);

-- Users & Roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'DRIVER', 'MECHANIC');

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB NOT NULL
);

-- Drivers
CREATE TYPE driver_status AS ENUM ('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'SICK_LEAVE');

CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    status driver_status NOT NULL DEFAULT 'OFF_DUTY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Logistics
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info JSONB NOT NULL,
    billing_address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TYPE job_status AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'INVOICED', 'PAID');

CREATE TABLE transport_jobs (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id),
    status job_status NOT NULL DEFAULT 'PENDING',
    agreed_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE routes (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES transport_jobs(id),
    origin GEOMETRY(POINT, 4326) NOT NULL,
    destination GEOMETRY(POINT, 4326) NOT NULL,
    waypoints GEOMETRY(LINESTRING, 4326)
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES transport_jobs(id),
    weight FLOAT NOT NULL,
    dimensions JSONB NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- Assignments
CREATE TYPE assignment_status AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status assignment_status NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Exclusion constraint to prevent overlapping assignments for the same vehicle
    EXCLUDE USING GIST (
        vehicle_id WITH =, 
        tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status = 'ACTIVE' OR status = 'SCHEDULED')
);

-- Maintenance
CREATE TYPE maintenance_type AS ENUM ('PREVENTIVE', 'REPAIR', 'INSPECTION', 'ACCIDENT');

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    type maintenance_type NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY,
    vehicle_type vehicle_type NOT NULL,
    interval_km INTEGER NOT NULL,
    interval_months INTEGER NOT NULL
);

CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    entity_id UUID NOT NULL, -- Can be vehicle_id or driver_id
    type VARCHAR(50) NOT NULL,
    severity alert_severity NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Telemetry (Partitioned)
CREATE TABLE vehicle_telemetry (
    time TIMESTAMPTZ NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    location GEOMETRY(POINT, 4326) NOT NULL,
    speed FLOAT NOT NULL,
    fuel_level FLOAT NOT NULL,
    engine_status JSONB
) PARTITION BY RANGE (time);

CREATE INDEX idx_telemetry_vehicle_time ON vehicle_telemetry (vehicle_id, time DESC);

-- Create a default partition for the current month (example)
CREATE TABLE vehicle_telemetry_default PARTITION OF vehicle_telemetry DEFAULT;
