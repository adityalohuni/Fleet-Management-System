CREATE TYPE vehicle_type AS ENUM ('TRUCK', 'VAN', 'SEDAN');
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE fuel_type AS ENUM ('DIESEL', 'GASOLINE', 'ELECTRIC');

CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    vin VARCHAR(255) UNIQUE NOT NULL,
    license_plate VARCHAR(255) UNIQUE NOT NULL,
    type vehicle_type NOT NULL,
    status vehicle_status NOT NULL,
    current_mileage INTEGER NOT NULL,
    fuel_type fuel_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
