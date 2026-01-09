/**
 * Form validation utilities for fleet management system
 */

export const ValidationErrors = {
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number (10+ digits)',
  INVALID_LICENSE: 'License number must be 5-20 characters',
  REQUIRED_FIELD: 'This field is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  DUPLICATE_LICENSE: 'A driver with this license number already exists',
  INVALID_DATE: 'Please enter a valid date',
  END_DATE_BEFORE_START: 'End date must be after start date',
  INVALID_COST: 'Cost must be a positive number',
  INVALID_MILEAGE: 'Mileage must be a positive number',
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Phone validation - 10+ digits
const PHONE_REGEX = /^\d{10,}$/;

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return PHONE_REGEX.test(cleaned);
}

export function validateLicense(license: string): boolean {
  return license.length >= 5 && license.length <= 20;
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateCost(cost: string | number): boolean {
  const num = typeof cost === 'string' ? parseFloat(cost) : cost;
  return !isNaN(num) && num > 0;
}

export function validateMileage(mileage: string | number): boolean {
  const num = typeof mileage === 'string' ? parseFloat(mileage) : mileage;
  return !isNaN(num) && num >= 0;
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  } catch {
    return false;
  }
}

// Form validation helpers
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateVehicleForm(data: {
  model?: string;
  type?: string;
  status?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.model?.trim()) {
    errors.model = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.type) {
    errors.type = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.status) {
    errors.status = ValidationErrors.REQUIRED_FIELD;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDriverForm(data: {
  name?: string;
  license?: string;
  email?: string;
  phone?: string;
  availability?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.license?.trim()) {
    errors.license = ValidationErrors.REQUIRED_FIELD;
  } else if (!validateLicense(data.license)) {
    errors.license = ValidationErrors.INVALID_LICENSE;
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = ValidationErrors.INVALID_EMAIL;
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = ValidationErrors.INVALID_PHONE;
  }

  if (!data.availability) {
    errors.availability = ValidationErrors.REQUIRED_FIELD;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAuthForm(data: {
  email?: string;
  password?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.email?.trim()) {
    errors.email = ValidationErrors.REQUIRED_FIELD;
  } else if (!validateEmail(data.email)) {
    errors.email = ValidationErrors.INVALID_EMAIL;
  }

  if (!data.password) {
    errors.password = ValidationErrors.REQUIRED_FIELD;
  } else if (!validatePassword(data.password)) {
    errors.password = ValidationErrors.PASSWORD_TOO_SHORT;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAssignmentForm(data: {
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.vehicleId) {
    errors.vehicleId = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.driverId) {
    errors.driverId = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.startDate) {
    errors.startDate = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.endDate) {
    errors.endDate = ValidationErrors.REQUIRED_FIELD;
  } else if (data.startDate && !validateDateRange(data.startDate, data.endDate)) {
    errors.endDate = ValidationErrors.END_DATE_BEFORE_START;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateMaintenanceForm(data: {
  vehicleId?: string;
  type?: string;
  cost?: string | number;
  provider?: string;
  date?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.vehicleId) {
    errors.vehicleId = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.type) {
    errors.type = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.cost) {
    errors.cost = ValidationErrors.REQUIRED_FIELD;
  } else if (!validateCost(data.cost)) {
    errors.cost = ValidationErrors.INVALID_COST;
  }

  if (!data.provider?.trim()) {
    errors.provider = ValidationErrors.REQUIRED_FIELD;
  }

  if (!data.date) {
    errors.date = ValidationErrors.REQUIRED_FIELD;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
