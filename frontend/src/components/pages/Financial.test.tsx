import { render, screen } from "@testing-library/react";
import { Financial } from "./Financial";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock hooks
const mockSummary = [
  { month: "Jan", revenue: "1000", cost: "500", profit: "500" },
  { month: "Feb", revenue: "1200", cost: "600", profit: "600" },
];

const mockProfitability = [
  { vehicle_id: "v1", vehicle_plate: "ABC-123", revenue: "500", cost: "200", profit: "300", rank: 1 },
];

vi.mock("../../hooks/useFinancial", () => ({
  useMonthlySummary: () => ({ data: mockSummary, isLoading: false }),
  useVehicleProfitability: () => ({ data: mockProfitability, isLoading: false }),
}));

// Mock Recharts to avoid ResizeObserver issues
vi.mock("recharts", async () => {
  const OriginalModule = await vi.importActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 800 }}>{children}</div>
    ),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("Financial Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders financial summary cards", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Financial />
      </QueryClientProvider>
    );
    // Total Revenue: 1000 + 1200 = 2200
    expect(screen.getByText("$2,200")).toBeInTheDocument();
    // Total Profit: 500 + 600 = 1100
    expect(screen.getByText("$1,100")).toBeInTheDocument();
    // Margin: (1100 / 2200) * 100 = 50.0%
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });

  it("renders vehicle profitability table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Financial />
      </QueryClientProvider>
    );
    expect(screen.getByText("ABC-123")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });
});
