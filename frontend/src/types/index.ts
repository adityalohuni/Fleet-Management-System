export interface Vehicle {
  id: string;
  model: string;
  type: string;
  status: "Available" | "Assigned" | "In Maintenance";
  mileage: number;
  lastService: string;
  utilization: number;
}

export interface MaintenanceRecord {
  id?: string;
  date: string;
  type: string;
  cost: number;
  provider: string;
  description?: string;
  vehicleId?: string;
}

export interface Alert {
  id: string;
  entityId: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  licenseExpiry: string;
  availability: "Available" | "On Duty" | "Off Duty";
  hoursThisWeek: number;
  wageRate: number;
  phone: string;
  email: string;
}

export interface Assignment {
  id: string;
  vehicleId: string;
  driverId: string;
  vehicleName?: string; // For display
  driverName?: string; // For display
  serviceId?: string;
  status: "Active" | "Completed" | "Scheduled" | "Cancelled";
  startDate: string;
  endDate: string;
  location: string;
  progress: number;
}

export interface DashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  activeDrivers: number;
  driversOnDuty: number;
  servicesInProgress: number;
  servicesCompletedToday: number;
  upcomingMaintenance: number;
  overdueMaintenance: number;
}

export interface ChartData {
  label: string; // month or vehicle
  value: number; // utilization, cost, or profit
}

export interface Alert {
  id?: string;
  type: "maintenance" | "license" | "service";
  message: string;
  severity: "high" | "medium" | "low";
}

export interface MonthlyFinancialSummary {
  month: string;
  revenue: string;
  cost: string;
  profit: string;
}

export interface VehicleProfitability {
  vehicle_id: string;
  vehicle_plate: string;
  revenue: string;
  cost: string;
  profit: string;
  rank: number;
}
