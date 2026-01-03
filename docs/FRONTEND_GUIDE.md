# Fleet Management System - Frontend Integration Guide

## 1. Overview

This guide covers the integration between the React frontend and the Rust backend API. It provides patterns for API client generation, state management, data fetching, and type safety.

### 1.1 Technology Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (shadcn/ui style)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **State Management**: TanStack Query (React Query)
- **API Client**: Auto-generated from OpenAPI spec

### 1.2 Architecture
```
┌─────────────────────────────────────┐
│   React Components                   │
│   ├─ Pages (Dashboard, Vehicles)    │
│   └─ UI Components                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Custom Hooks (useVehicles, etc.)  │
│   - TanStack Query                   │
│   - Caching & Invalidation           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Generated API Client               │
│   - Type-safe service methods        │
│   - Auto-generated from OpenAPI      │
└──────────────┬──────────────────────┘
               │ HTTPS/JSON
┌──────────────▼──────────────────────┐
│   Backend REST API                   │
│   http://localhost:8080/api          │
└─────────────────────────────────────┘
```

## 2. API Client Generation

### 2.1 Setup
Install the code generator:
```bash
npm install --save-dev openapi-typescript-codegen
```

### 2.2 Generate Client
Add script to `package.json`:
```json
{
  "scripts": {
    "generate:api": "openapi --input http://localhost:8080/api-docs/openapi.json --output ./src/client --client axios"
  }
}
```

Run generation:
```bash
# Start backend first
cd backend && cargo run

# In another terminal, generate client
cd frontend && npm run generate:api
```

### 2.3 Generated Structure
```
src/client/
├── index.ts                    # Main exports
├── core/                       # Core HTTP client
├── models/                     # TypeScript interfaces/types
│   ├── Vehicle.ts
│   ├── Driver.ts
│   ├── Assignment.ts
│   └── ...
└── services/                   # API service methods
    ├── VehicleService.ts
    ├── DriverService.ts
    ├── AssignmentService.ts
    └── ...
```

### 2.4 Usage Example
```typescript
import { VehicleService } from '@/client';

// Generated service has type-safe methods
const vehicles = await VehicleService.getVehicles();
const vehicle = await VehicleService.getVehicle('uuid');
const created = await VehicleService.createVehicle({
  make: 'Ford',
  model: 'Transit',
  // ... fully typed DTO
});
```

## 3. State Management with TanStack Query

### 3.1 Setup
Install TanStack Query:
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

Configure in `main.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default
      retry: 1,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

### 3.2 Query Pattern
Create custom hooks in `src/hooks/`:

```typescript
// src/hooks/useVehicles.ts
import { useQuery } from '@tanstack/react-query';
import { VehicleService } from '@/client';

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => VehicleService.getVehicles(),
    staleTime: 5 * 60 * 1000, // 5 minutes (reference data)
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => VehicleService.getVehicle(id),
    enabled: !!id, // Only fetch if ID provided
  });
}
```

### 3.3 Mutation Pattern
```typescript
// src/hooks/useVehicleMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VehicleService, CreateVehicleDto } from '@/client';

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateVehicleDto) => 
      VehicleService.createVehicle(dto),
    onSuccess: () => {
      // Invalidate and refetch vehicles list
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      console.error('Failed to create vehicle:', error);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateVehicleDto }) => 
      VehicleService.updateVehicle(id, dto),
    onSuccess: (_, variables) => {
      // Invalidate specific vehicle and list
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
```

### 3.4 Usage in Components
```typescript
import { useVehicles, useCreateVehicle } from '@/hooks/useVehicles';

function VehiclesPage() {
  const { data: vehicles, isLoading, error } = useVehicles();
  const createVehicle = useCreateVehicle();
  
  const handleCreate = async (dto: CreateVehicleDto) => {
    await createVehicle.mutateAsync(dto);
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {vehicles?.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
```

## 4. ID Resolution Strategy

### 4.1 The Problem
Backend returns UUIDs for related entities:
```json
{
  "id": "...",
  "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

Frontend needs to display names:
```
Vehicle: Ford Transit
Driver: John Smith
```

### 4.2 Solution: Resolution Hooks
Create hooks that resolve IDs to display values using cached data:

```typescript
// src/hooks/useIdResolution.ts
import { useVehicles } from './useVehicles';
import { useDrivers } from './useDrivers';

export function useVehicleName(vehicleId: string | undefined) {
  const { data: vehicles } = useVehicles();
  
  if (!vehicleId) return 'N/A';
  
  const vehicle = vehicles?.find(v => v.id === vehicleId);
  return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
}

export function useDriverName(driverId: string | undefined) {
  const { data: drivers } = useDrivers();
  
  if (!driverId) return 'N/A';
  
  const driver = drivers?.find(d => d.id === driverId);
  return driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown Driver';
}

// For multiple resolutions
export function useVehicleNames(vehicleIds: string[]) {
  const { data: vehicles } = useVehicles();
  
  return vehicleIds.map(id => {
    const vehicle = vehicles?.find(v => v.id === id);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown';
  });
}
```

### 4.3 Usage in Components
```typescript
function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const vehicleName = useVehicleName(assignment.vehicle_id);
  const driverName = useDriverName(assignment.driver_id);
  
  return (
    <tr>
      <td>{vehicleName}</td>
      <td>{driverName}</td>
      <td>{assignment.status}</td>
    </tr>
  );
}
```

## 5. Page-by-Page Integration

### 5.1 Authentication (Login Page)

**API Endpoint**: `POST /api/auth/login`

**Implementation**:
```typescript
// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { AuthService, LoginDto } from '@/client';

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginDto) => 
      AuthService.login(credentials),
    onSuccess: (response) => {
      // Store token
      localStorage.setItem('auth_token', response.token);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    },
  });
}

// src/components/pages/Login.tsx
function LoginPage() {
  const login = useLogin();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    await login.mutateAsync({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
      {login.error && <ErrorMessage error={login.error} />}
    </form>
  );
}
```

### 5.2 Dashboard

**Data Sources**:
1. Financial summary: `GET /api/financial/summary`
2. Vehicles: `GET /api/vehicles`
3. Drivers: `GET /api/drivers`
4. Recent assignments: `GET /api/assignments`
5. Maintenance alerts: `GET /api/maintenance/alerts`

**Implementation**:
```typescript
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { FinancialService, MaintenanceService } from '@/client';
import { useVehicles } from './useVehicles';
import { useDrivers } from './useDrivers';
import { useAssignments } from './useAssignments';

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial', 'summary'],
    queryFn: () => FinancialService.getSummary(),
  });
}

export function useMaintenanceAlerts() {
  return useQuery({
    queryKey: ['maintenance', 'alerts'],
    queryFn: () => MaintenanceService.getAlerts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// src/components/pages/Dashboard.tsx
function Dashboard() {
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  const { data: assignments } = useAssignments();
  const { data: financialSummary } = useFinancialSummary();
  const { data: alerts } = useMaintenanceAlerts();
  
  // Calculate KPIs
  const totalVehicles = vehicles?.length ?? 0;
  const availableVehicles = vehicles?.filter(
    v => v.status === 'AVAILABLE'
  ).length ?? 0;
  
  const activeDrivers = drivers?.filter(
    d => d.status === 'ON_DUTY'
  ).length ?? 0;
  
  const recentAssignments = assignments?.slice(0, 5) ?? [];
  
  // Get latest financial data
  const latestFinancial = financialSummary?.[financialSummary.length - 1];
  
  return (
    <div className="dashboard">
      <KPICards
        totalVehicles={totalVehicles}
        availableVehicles={availableVehicles}
        activeDrivers={activeDrivers}
        revenue={latestFinancial?.revenue}
        costs={latestFinancial?.costs}
      />
      
      <RecentAssignments assignments={recentAssignments} />
      
      <MaintenanceAlerts alerts={alerts} />
      
      <FinancialCharts data={financialSummary} />
    </div>
  );
}
```

### 5.3 Vehicles Management

**API Endpoints**:
- List: `GET /api/vehicles`
- Create: `POST /api/vehicles`
- Details: `GET /api/vehicles/{id}`
- Update: `PUT /api/vehicles/{id}`
- Delete: `DELETE /api/vehicles/{id}`

**Implementation**:
```typescript
// src/components/pages/Vehicles.tsx
import { useVehicles, useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicles';

function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const handleCreate = async (dto: CreateVehicleDto) => {
    await createVehicle.mutateAsync(dto);
    setIsCreateDialogOpen(false);
  };
  
  const handleUpdateStatus = async (id: string, status: VehicleStatus) => {
    await updateVehicle.mutateAsync({ id, dto: { status } });
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1>Vehicles</h1>
        <button onClick={() => setIsCreateDialogOpen(true)}>
          Add Vehicle
        </button>
      </div>
      
      <VehiclesTable
        vehicles={vehicles ?? []}
        onUpdateStatus={handleUpdateStatus}
      />
      
      <CreateVehicleDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
```

### 5.4 Drivers Management

**API Endpoints**:
- List: `GET /api/drivers`
- Create: `POST /api/drivers`
- Details: `GET /api/drivers/{id}`
- Update: `PUT /api/drivers/{id}`

**Implementation**:
```typescript
// src/hooks/useDrivers.ts
export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: () => DriverService.getDrivers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateDriverDto) => DriverService.createDriver(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

// src/components/pages/Drivers.tsx
function DriversPage() {
  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  
  // Similar structure to VehiclesPage
  return (
    <div>
      <DriversTable drivers={drivers ?? []} />
    </div>
  );
}
```

### 5.5 Assignments Management

**API Endpoints**:
- List: `GET /api/assignments`
- Create: `POST /api/assignments`
- Update status: `PATCH /api/assignments/{id}/status`

**Implementation with ID Resolution**:
```typescript
// src/hooks/useAssignments.ts
export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => AssignmentService.getAssignments(),
    staleTime: 1 * 60 * 1000, // 1 minute (more dynamic data)
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateAssignmentDto) => 
      AssignmentService.createAssignment(dto),
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

// src/components/pages/Assignments.tsx
function AssignmentsPage() {
  const { data: assignments } = useAssignments();
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  const createAssignment = useCreateAssignment();
  
  const handleCreate = async (formData: AssignmentFormData) => {
    await createAssignment.mutateAsync({
      vehicle_id: formData.vehicleId,
      driver_id: formData.driverId,
      start_time: formData.startTime.toISOString(),
      end_time: formData.endTime?.toISOString(),
      status: 'SCHEDULED',
    });
  };
  
  return (
    <div>
      <AssignmentsTable assignments={assignments ?? []} />
      
      <CreateAssignmentForm
        vehicles={vehicles ?? []}
        drivers={drivers ?? []}
        onSubmit={handleCreate}
      />
    </div>
  );
}

// src/components/AssignmentRow.tsx
function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const vehicleName = useVehicleName(assignment.vehicle_id);
  const driverName = useDriverName(assignment.driver_id);
  
  return (
    <tr>
      <td>{vehicleName}</td>
      <td>{driverName}</td>
      <td>
        <StatusBadge status={assignment.status} />
      </td>
      <td>{formatDate(assignment.start_time)}</td>
    </tr>
  );
}
```

### 5.6 Maintenance Management

**API Endpoints**:
- Alerts: `GET /api/maintenance/alerts`
- Records: `GET /api/maintenance/records`
- Log maintenance: `POST /api/maintenance/records`

**Implementation**:
```typescript
// src/hooks/useMaintenance.ts
export function useMaintenanceAlerts() {
  return useQuery({
    queryKey: ['maintenance', 'alerts'],
    queryFn: () => MaintenanceService.getAlerts(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMaintenanceRecords() {
  return useQuery({
    queryKey: ['maintenance', 'records'],
    queryFn: () => MaintenanceService.getRecords(),
  });
}

export function useLogMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateMaintenanceRecordDto) => 
      MaintenanceService.logMaintenance(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// src/components/pages/Maintenance.tsx
function MaintenancePage() {
  const { data: alerts } = useMaintenanceAlerts();
  const { data: records } = useMaintenanceRecords();
  const logMaintenance = useLogMaintenance();
  
  const dueSoon = alerts?.filter(a => a.severity === 'medium');
  const overdue = alerts?.filter(a => a.severity === 'high');
  
  return (
    <div>
      <AlertsSection dueSoon={dueSoon} overdue={overdue} />
      <MaintenanceHistory records={records} />
    </div>
  );
}
```

### 5.7 Financial Dashboard

**API Endpoint**: `GET /api/financial/summary`

**Implementation**:
```typescript
// src/components/pages/Financial.tsx
function FinancialPage() {
  const { data: summary } = useFinancialSummary();
  
  return (
    <div>
      <RevenueVsCostChart data={summary} />
      <VehicleProfitabilityTable data={summary} />
      <MonthlyTrendsChart data={summary} />
    </div>
  );
}
```

## 6. Authentication & Authorization

### 6.1 Auth Context
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };
  
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 6.2 Axios Interceptor for JWT
```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// Add JWT to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 6.3 Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

## 7. Type Safety Best Practices

### 7.1 Use Generated Types
```typescript
// ✅ Good - Use generated types
import type { Vehicle, CreateVehicleDto } from '@/client';

function createVehicle(dto: CreateVehicleDto): Promise<Vehicle> {
  return VehicleService.createVehicle(dto);
}

// ❌ Bad - Manual types that drift from API
interface MyVehicle {
  id: string;
  name: string; // Field might not exist in API
}
```

### 7.2 Type Guards
```typescript
// src/lib/typeGuards.ts
import type { VehicleStatus } from '@/client';

export function isVehicleStatus(value: unknown): value is VehicleStatus {
  return typeof value === 'string' && 
    ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'OUT_OF_SERVICE'].includes(value);
}
```

### 7.3 Enum Usage
```typescript
import { VehicleStatus, DriverStatus } from '@/client';

// ✅ Type-safe comparisons
if (vehicle.status === VehicleStatus.AVAILABLE) {
  // ...
}

// ✅ Type-safe dropdown options
const statusOptions = Object.values(VehicleStatus);
```

## 8. Error Handling

### 8.1 Global Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 8.2 Query Error Handling
```typescript
function VehiclesPage() {
  const { data, error, isError } = useVehicles();
  
  if (isError) {
    return (
      <ErrorMessage
        title="Failed to load vehicles"
        message={error.message}
        retry={() => queryClient.invalidateQueries(['vehicles'])}
      />
    );
  }
  
  // ...
}
```

### 8.3 Mutation Error Handling
```typescript
const createVehicle = useCreateVehicle();

const handleSubmit = async (dto: CreateVehicleDto) => {
  try {
    await createVehicle.mutateAsync(dto);
    toast.success('Vehicle created successfully');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Failed to create vehicle';
      toast.error(message);
    }
  }
};
```

## 9. Performance Optimization

### 9.1 Query Stale Times
```typescript
// Reference data (changes rarely) - 5 minutes
useQuery({ queryKey: ['vehicles'], staleTime: 5 * 60 * 1000 });
useQuery({ queryKey: ['drivers'], staleTime: 5 * 60 * 1000 });

// Dynamic data (changes frequently) - 1 minute
useQuery({ queryKey: ['assignments'], staleTime: 1 * 60 * 1000 });

// Real-time data (always fresh) - 0 seconds
useQuery({ queryKey: ['telemetry'], staleTime: 0 });
```

### 9.2 Pagination
```typescript
export function useVehiclesPaginated(page: number, limit: number = 20) {
  return useQuery({
    queryKey: ['vehicles', 'paginated', page, limit],
    queryFn: () => VehicleService.getVehicles({ page, limit }),
    keepPreviousData: true, // Smooth pagination
  });
}
```

### 9.3 Prefetching
```typescript
const queryClient = useQueryClient();

// Prefetch on hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => VehicleService.getVehicle(vehicleId),
  });
};
```

## 10. Testing

### 10.1 Mock API for Tests
```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/vehicles', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', make: 'Ford', model: 'Transit', status: 'AVAILABLE' },
    ]));
  }),
  
  rest.post('/api/vehicles', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: '2', ...req.body }));
  }),
];
```

### 10.2 Testing Custom Hooks
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useVehicles } from '@/hooks/useVehicles';

test('useVehicles returns vehicle data', async () => {
  const { result } = renderHook(() => useVehicles(), {
    wrapper: QueryClientProvider,
  });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(result.current.data).toHaveLength(1);
  expect(result.current.data[0].make).toBe('Ford');
});
```

## 11. Environment Configuration

### 11.1 Environment Variables
```bash
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.fleet.example.com
```

### 11.2 Usage
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## 12. Implementation Checklist

### Setup
- [ ] Install TanStack Query
- [ ] Install openapi-typescript-codegen
- [ ] Generate API client from OpenAPI spec
- [ ] Configure QueryClient with default options
- [ ] Setup AuthContext and ProtectedRoute

### Core Hooks
- [ ] `useVehicles` / `useVehicle(id)`
- [ ] `useDrivers` / `useDriver(id)`
- [ ] `useAssignments` / `useAssignment(id)`
- [ ] `useFinancialSummary`
- [ ] `useMaintenanceAlerts`
- [ ] `useCreateVehicle`, `useUpdateVehicle`, etc.

### ID Resolution
- [ ] `useVehicleName(id)`
- [ ] `useDriverName(id)`

### Pages
- [ ] Replace mock data in Dashboard
- [ ] Replace mock data in Vehicles page
- [ ] Replace mock data in Drivers page
- [ ] Replace mock data in Assignments page
- [ ] Replace mock data in Maintenance page
- [ ] Replace mock data in Financial page

### Forms & Mutations
- [ ] Connect Create Vehicle form to API
- [ ] Connect Create Driver form to API
- [ ] Connect Create Assignment form to API
- [ ] Connect Log Maintenance form to API

---

**Document Version**: 1.0  
**Last Updated**: January 3, 2026  
**Maintainer**: Frontend Team
