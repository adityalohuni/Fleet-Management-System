# Frontend Integration Plan & Data Mapping

This document details the integration strategy between the React frontend and the Rust backend, specifically focusing on data mapping, API endpoints, and type definitions.

## 1. Integration Strategy

### 1.1 API Client
We will use `openapi-typescript-codegen` to generate a typed API client.
*   **Source**: `http://localhost:8080/api-docs/openapi.json`
*   **Output**: `src/api`
*   **Usage**: `VehicleService.getVehicles()`, `AuthService.login()`.

### 1.2 State Management (TanStack Query)
*   **Server State**: All API data will be managed via `useQuery` and `useMutation`.
*   **Caching**: Reference data (Vehicles, Drivers) will be cached with a longer `staleTime` (e.g., 5 minutes).
*   **Invalidation**: Mutations (Create/Update) will invalidate relevant query keys to trigger refetches.

### 1.3 ID Resolution
The backend typically returns IDs (UUIDs) for related entities (e.g., `driver_id` in an Assignment). The frontend needs to display names (e.g., "John Smith").
*   **Strategy**: Maintain cached lists of `Drivers` and `Vehicles` via React Query. Create custom hooks `useDriverName(id)` and `useVehicleName(id)` to resolve IDs to names efficiently from the cache.

---

## 2. Page-by-Page Data Mapping

### 2.1 Authentication (Login)
*   **Component**: `LoginPage`
*   **Action**: User submits Email/Password.
*   **Backend Call**: `POST /api/auth/login`
*   **Request Body**: `LoginDto`
    ```typescript
    { email: string; password: string; }
    ```
*   **Response**: `AuthResponse`
    ```typescript
    { token: string; user: User; }
    ```
*   **Post-Action**: Store `token` in localStorage; Store `user` in AuthContext; Redirect to Dashboard.

### 2.2 Dashboard
*   **Component**: `Dashboard`
*   **Data Requirements**:
    1.  **KPI Cards** (Revenue, Costs, Profit):
        *   *Call*: `GET /api/financial/summary`
        *   *Response*: `MonthlyFinancialSummary[]` (Take latest month)
    2.  **Fleet Status** (Active vs Total Vehicles):
        *   *Call*: `GET /api/vehicles`
        *   *Logic*: Count total and count where `status === 'ASSIGNED'`.
    3.  **Recent Assignments**:
        *   *Call*: `GET /api/assignments` (Need to implement `?limit=5` on backend or slice on frontend)
        *   *Response*: `VehicleAssignment[]`
    4.  **Maintenance Alerts**:
        *   *Call*: `GET /api/maintenance/alerts`
        *   *Response*: `Alert[]`

### 2.3 Vehicles Management
*   **Component**: `VehiclesPage`
*   **List View**:
    *   *Call*: `GET /api/vehicles`
    *   *Response*: `Vehicle[]`
    *   *Columns*: Make, Model, Year, License Plate, Status, Mileage.
*   **Create Vehicle**:
    *   *Call*: `POST /api/vehicles`
    *   *Body*: `CreateVehicleDto`
    *   *On Success*: Invalidate `['vehicles']` query.
*   **Vehicle Details** (Dialog/Page):
    *   *Call*: `GET /api/vehicles/{id}`
    *   *Response*: `Vehicle`

### 2.4 Drivers Management
*   **Component**: `DriversPage`
*   **List View**:
    *   *Call*: `GET /api/drivers`
    *   *Response*: `Driver[]`
    *   *Columns*: Name, License, Status, Phone.
*   **Create Driver**:
    *   *Call*: `POST /api/drivers`
    *   *Body*: `CreateDriverDto`
*   **Update Status**:
    *   *Call*: `PUT /api/drivers/{id}` (Need to ensure backend supports partial update or full update)

### 2.5 Assignments (Operations)
*   **Component**: `AssignmentsPage`
*   **List View**:
    *   *Call*: `GET /api/assignments`
    *   *Response*: `VehicleAssignment[]`
    *   *Display Issue*: Returns `vehicle_id` and `driver_id`.
    *   *Solution*: Use `useVehicles()` and `useDrivers()` to map IDs to names.
*   **Create Assignment**:
    *   *Call*: `POST /api/assignments`
    *   *Body*: `CreateAssignmentDto`
    *   *Form Data*: Select Vehicle (Dropdown from `GET /vehicles`), Select Driver (Dropdown from `GET /drivers`).
*   **Update Status** (e.g., Complete):
    *   *Call*: `PATCH /api/assignments/{id}/status`
    *   *Body*: `AssignmentStatus` (Enum)

### 2.6 Logistics (Services)
*   **Component**: `ServicesPage`
*   **List View**:
    *   *Call*: `GET /api/logistics/jobs`
    *   *Response*: `TransportJob[]`
*   **Create Job**:
    *   *Call*: `POST /api/logistics/jobs`
    *   *Body*: `CreateTransportJobDto`

### 2.7 Maintenance
*   **Component**: `MaintenancePage`
*   **Alerts List**:
    *   *Call*: `GET /api/maintenance/alerts`
    *   *Response*: `Alert[]`
*   **Maintenance History**:
    *   *Call*: `GET /api/maintenance`
    *   *Response*: `MaintenanceRecord[]`
*   **Log Maintenance**:
    *   *Call*: `POST /api/maintenance`
    *   *Body*: `CreateMaintenanceRecordDto`

### 2.8 Financial Analysis
*   **Component**: `FinancialPage`
*   **Summary Chart**:
    *   *Call*: `GET /api/financial/summary`
    *   *Response*: `MonthlyFinancialSummary[]`
    *   *Visualization*: Bar/Line chart of Revenue vs Cost.
*   **Vehicle Profitability**:
    *   *Call*: `GET /api/financial/vehicle-profitability`
    *   *Response*: `VehicleProfitability[]`
    *   *Display*: Table sorted by Profit.

---

## 3. Type Definitions (Reference)

These types will be auto-generated, but here is the expected structure based on Backend DTOs.

### Enums
*   `VehicleStatus`: `AVAILABLE` | `ASSIGNED` | `MAINTENANCE` | `OUT_OF_SERVICE`
*   `DriverStatus`: `AVAILABLE` | `ON_DUTY` | `OFF_DUTY` | `SICK_LEAVE`
*   `AssignmentStatus`: `SCHEDULED` | `ACTIVE` | `COMPLETED` | `CANCELLED`

### DTOs

**CreateVehicleDto**
```typescript
interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  type: VehicleType;
  current_mileage: number;
  fuel_type: FuelType;
}
```

**CreateAssignmentDto**
```typescript
interface CreateAssignmentDto {
  vehicle_id: string; // UUID
  driver_id: string; // UUID
  start_time: string; // ISO Date
  end_time?: string;
  status: AssignmentStatus;
}
```

## 4. Implementation Checklist

1.  [ ] **Generate Client**: Run `openapi-typescript-codegen`.
2.  [ ] **Auth Provider**: Implement `AuthProvider.tsx` with Login logic.
3.  [ ] **API Hooks**: Create `useVehicles`, `useDrivers`, `useAssignments` hooks using React Query.
4.  [ ] **Replace Mocks**:
    *   [ ] Dashboard
    *   [ ] Vehicles Table
    *   [ ] Drivers Table
    *   [ ] Assignments Table
5.  [ ] **Forms**: Connect "Create" forms to `useMutation` hooks.
