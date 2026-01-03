# Frontend Analysis & Data Requirements

This document outlines the data structures, API endpoints, and models expected by the frontend application based on the current mock implementation.

## 1. Dashboard (`/dashboard`)

### Data Requirements
- **KPI Metrics**:
  - Total Vehicles (count)
  - Available Vehicles (count)
  - Active Drivers (count)
  - Drivers On Duty (count)
- **Utilization Chart**:
  - Array of `{ month: string, utilization: number }`
- **Maintenance Cost Chart**:
  - Array of `{ month: string, cost: number }`
- **Profitability Chart**:
  - Array of `{ vehicle: string, profit: number }`
- **Recent Assignments**:
  - Array of:
    ```typescript
    {
      id: string;
      vehicle: string; // Vehicle ID/Name
      driver: string; // Driver Name
      status: "In Progress" | "Completed" | "Scheduled";
      completion: number; // 0-100
    }
    ```
- **Alerts**:
  - Array of:
    ```typescript
    {
      type: "maintenance" | "license" | "service";
      message: string;
      severity: "high" | "medium" | "low";
    }
    ```

## 2. Vehicles (`/vehicles`)

### Data Requirements
- **Vehicle List**:
  - Array of:
    ```typescript
    {
      id: string;
      model: string;
      type: "Truck" | "Van" | string;
      status: "Available" | "Assigned" | "In Maintenance";
      mileage: number;
      lastService: string; // ISO Date
      utilization: number; // 0-100
    }
    ```
- **Vehicle Details (Maintenance History)**:
  - Array of:
    ```typescript
    {
      date: string; // ISO Date
      type: string;
      cost: number;
      provider: string;
    }
    ```

### Expected API Interactions
- `GET /api/vehicles`: Fetch all vehicles.
- `GET /api/vehicles/{id}/maintenance`: Fetch maintenance history for a specific vehicle.
- `POST /api/vehicles`: Create a new vehicle.
- `PUT /api/vehicles/{id}`: Update vehicle status/details.

## 3. Drivers (`/drivers`)

### Data Requirements
- **Driver List**:
  - Array of:
    ```typescript
    {
      id: string;
      name: string;
      license: string;
      licenseExpiry: string; // ISO Date
      availability: "Available" | "On Duty" | "Off Duty";
      hoursThisWeek: number;
      wageRate: number;
      phone: string;
      email: string;
    }
    ```
- **Driver Details (Assignment History)**:
  - Array of:
    ```typescript
    {
      date: string; // ISO Date
      vehicle: string; // Vehicle ID
      route: string;
      hours: number;
    }
    ```

### Expected API Interactions
- `GET /api/drivers`: Fetch all drivers.
- `GET /api/drivers/{id}/assignments`: Fetch assignment history for a specific driver.
- `POST /api/drivers`: Register a new driver.
- `PUT /api/drivers/{id}`: Update driver details.

## 4. Assignments (`/assignments`)

### Data Requirements
- **Assignment List**:
  - Array of:
    ```typescript
    {
      id: string;
      vehicle: string; // Vehicle ID
      driver: string; // Driver Name
      service: string; // Service ID
      status: "Active" | "Completed" | "Scheduled" | "Cancelled";
      startDate: string; // ISO Date
      endDate: string; // ISO Date
      location: string;
      progress: number; // 0-100
    }
    ```

### Expected API Interactions
- `GET /api/assignments`: Fetch all assignments.
- `POST /api/assignments`: Create a new assignment.
- `PATCH /api/assignments/{id}/status`: Update assignment status.

## 5. Maintenance (`/maintenance`)

### Data Requirements
- **Maintenance Alerts**:
  - `dueSoon`: Array of `{ vehicle, type, dueDate, dueMileage }`
  - `overdue`: Array of `{ vehicle, type, dueDate, dueMileage }`
  - `completed`: Array of `{ vehicle, type, completedDate, cost }`
- **Maintenance Records**:
  - Array of:
    ```typescript
    {
      id: string;
      vehicle: string;
      date: string;
      type: string;
      cost: number;
      provider: string;
      notes: string;
    }
    ```
- **Cost Chart**:
  - Array of `{ month: string, cost: number }`

### Expected API Interactions
- `GET /api/maintenance/alerts`: Fetch maintenance alerts.
- `GET /api/maintenance/history`: Fetch all maintenance records.
- `POST /api/maintenance`: Schedule a maintenance task.
