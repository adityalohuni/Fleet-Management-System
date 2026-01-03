import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Truck, Users, Wrench, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  useDashboardMetrics, 
  useDashboardUtilization, 
  useDashboardRecentAssignments, 
  useDashboardAlerts 
} from "../../hooks/useDashboard";
import { Skeleton } from "../ui/skeleton";

const maintenanceCostData = [
  { month: "Jan", cost: 12500 },
  { month: "Feb", cost: 15800 },
  { month: "Mar", cost: 11200 },
  { month: "Apr", cost: 14500 },
  { month: "May", cost: 13200 },
  { month: "Jun", cost: 16800 },
];

const profitabilityData = [
  { vehicle: "TRK-101", profit: 8500 },
  { vehicle: "TRK-102", profit: 7200 },
  { vehicle: "TRK-103", profit: 9100 },
  { vehicle: "TRK-104", profit: 6800 },
  { vehicle: "VAN-201", profit: 5400 },
];

export function Dashboard() {
  const { data: metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { data: utilizationData, isLoading: isLoadingUtilization } = useDashboardUtilization();
  const { data: recentAssignments, isLoading: isLoadingAssignments } = useDashboardRecentAssignments();
  const { data: alerts, isLoading: isLoadingAlerts } = useDashboardAlerts();

  const isLoading = isLoadingMetrics || isLoadingUtilization || isLoadingAssignments || isLoadingAlerts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Fleet performance overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Vehicles</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.totalVehicles}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.availableVehicles} available now`}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Drivers</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.activeDrivers}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.driversOnDuty} on duty`}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Services in Progress</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
              <div className="w-5 h-5 bg-chart-3 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.servicesInProgress}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.servicesCompletedToday} completed today`}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming Maintenance</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.upcomingMaintenance}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.overdueMaintenance} overdue`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              {isLoadingUtilization ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <LineChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-chart-1)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-chart-1)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Maintenance Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={maintenanceCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="var(--color-chart-5)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-chart-5)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border">
        <CardHeader>
          <CardTitle>Profitability per Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="vehicle" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="profit" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAssignments ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-2 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    recentAssignments?.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.id}</TableCell>
                        <TableCell>{assignment.vehicleName}</TableCell>
                        <TableCell>{assignment.driverName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assignment.status === "Completed"
                                ? "default"
                                : assignment.status === "Active"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${assignment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{assignment.progress}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingAlerts ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              ) : (
                alerts?.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors duration-200"
                  >
                    <AlertTriangle
                      className={`w-5 h-5 flex-shrink-0 ${
                        alert.severity === "high"
                          ? "text-destructive"
                          : alert.severity === "medium"
                          ? "text-chart-3"
                          : "text-chart-4"
                      }`}
                    />
                    <div className="text-sm text-foreground">{alert.message}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}