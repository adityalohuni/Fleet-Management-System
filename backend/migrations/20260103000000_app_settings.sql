CREATE TABLE IF NOT EXISTS app_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  address TEXT NOT NULL,
  distance_unit TEXT NOT NULL,
  currency TEXT NOT NULL,
  date_format TEXT NOT NULL,
  notify_maintenance_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  notify_license_expiry BOOLEAN NOT NULL DEFAULT TRUE,
  notify_service_completion BOOLEAN NOT NULL DEFAULT TRUE,
  notify_payment BOOLEAN NOT NULL DEFAULT TRUE,
  notify_desktop BOOLEAN NOT NULL DEFAULT FALSE,
  notify_weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (
  id,
  company_name,
  contact_email,
  phone_number,
  time_zone,
  address,
  distance_unit,
  currency,
  date_format,
  notify_maintenance_alerts,
  notify_license_expiry,
  notify_service_completion,
  notify_payment,
  notify_desktop,
  notify_weekly_summary
)
VALUES (
  1,
  'FleetMaster Pro',
  'admin@fleetmaster.com',
  '+1 (555) 123-4567',
  'UTC-05:00 (EST)',
  '123 Fleet Street, Transport City, TC 12345',
  'Miles',
  'USD ($)',
  'MM/DD/YYYY',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
