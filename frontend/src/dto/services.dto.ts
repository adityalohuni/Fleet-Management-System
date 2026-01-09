export type JobStatus = 'Pending' | 'InProgress' | 'Delivered' | 'Invoiced' | 'Paid';

export interface CustomerDto {
  id: string;
  name: string;
  contact_info: unknown;
  billing_address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateCustomerDto {
  name: string;
  contact_info: unknown;
  billing_address: string;
}

export interface TransportJobDto {
  id: string;
  customer_id: string;
  status: JobStatus;
  agreed_price: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransportJobDto {
  customer_id: string;
  status: JobStatus;
  agreed_price: string;
}

export interface RouteDto {
  id: string;
  job_id: string;
  origin: unknown;
  destination: unknown;
  waypoints?: unknown | null;
}

export interface CreateRouteDto {
  job_id: string;
  origin: unknown;
  destination: unknown;
  waypoints?: unknown | null;
}

export interface ShipmentDto {
  id: string;
  job_id: string;
  weight: number;
  dimensions: unknown;
  type: string;
}

export interface CreateShipmentDto {
  job_id: string;
  weight: number;
  dimensions: unknown;
  type: string;
}
