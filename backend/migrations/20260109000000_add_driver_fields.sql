-- Add missing driver fields
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS wage_rate DECIMAL(10, 2) DEFAULT 25.00;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS license_expiry DATE;

-- Add name field to users table for proper driver names
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry ON drivers(license_expiry);
