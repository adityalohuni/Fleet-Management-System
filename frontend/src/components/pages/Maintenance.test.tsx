import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Maintenance } from "./Maintenance";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock scrollIntoView for Radix UI
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

// Mock hooks
const mockAlerts = [
  { id: "1", entityId: "v1", type: "Oil Change", severity: "High", isResolved: false },
];
const mockVehicles = [
  { id: "v1", make: "Toyota", model: "Camry", status: "Available" },
];
const mockRecords = [
  { id: "r1", vehicleId: "v1", type: "Preventive", cost: 100, date: "2025-01-01T10:00:00Z", provider: "Service Center" },
];

const mockResolveAlert = vi.fn();
const mockCreateRecord = vi.fn();

vi.mock("../../hooks/useMaintenance", () => ({
  useAlerts: () => ({ data: mockAlerts, isLoading: false }),
  useResolveAlert: () => ({ mutate: mockResolveAlert }),
  useMaintenanceRecords: (vehicleId: string) => ({ 
    data: vehicleId === "v1" ? mockRecords : [], 
    isLoading: false 
  }),
  useCreateMaintenanceRecord: () => ({ mutateAsync: mockCreateRecord }),
}));

vi.mock("../../hooks/useVehicles", () => ({
  useVehicles: () => ({ data: mockVehicles, isLoading: false }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("Maintenance Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active alerts", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Maintenance />
      </QueryClientProvider>
    );
    expect(screen.getByText("Oil Change")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("allows resolving an alert", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Maintenance />
      </QueryClientProvider>
    );
    fireEvent.click(screen.getByText("Resolve"));
    expect(mockResolveAlert).toHaveBeenCalledWith("1");
  });

  it("shows maintenance history when vehicle is selected", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Maintenance />
      </QueryClientProvider>
    );
    
    // Select vehicle
    const trigger = screen.getByText("Select vehicle");
    fireEvent.click(trigger);
    
    const option = await screen.findByText("Toyota Camry");
    fireEvent.click(option);

    expect(screen.getByText("Service Center")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("opens log service dialog", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Maintenance />
      </QueryClientProvider>
    );
    fireEvent.click(screen.getByText("Log Service"));
    expect(screen.getByText("Log Maintenance Service")).toBeInTheDocument();
  });
});
