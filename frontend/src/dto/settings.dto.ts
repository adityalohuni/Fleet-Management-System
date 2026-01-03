export interface AppSettingsDto {
  id: number;
  company_name: string;
  contact_email: string;
  phone_number: string;
  time_zone: string;
  address: string;
  distance_unit: string;
  currency: string;
  date_format: string;
  notify_maintenance_alerts: boolean;
  notify_license_expiry: boolean;
  notify_service_completion: boolean;
  notify_payment: boolean;
  notify_sms: boolean;
  notify_desktop: boolean;
  notify_weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}

export type UpdateAppSettingsDto = Omit<AppSettingsDto, 'id' | 'created_at' | 'updated_at'>;
