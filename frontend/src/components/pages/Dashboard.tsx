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

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8 pb-8">
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1">Dashboard</h1>
        <p className="text-lg text-muted-foreground font-medium">{currentDate}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Vehicles</CardTitle>
            <Truck className="w-5 h-5 text-primary opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.totalVehicles}
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.availableVehicles} available now`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active Drivers</CardTitle>
            <Users className="w-5 h-5 text-chart-2 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.activeDrivers}
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.driversOnDuty} on duty`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Services in Progress</CardTitle>
            <div className="w-5 h-5 rounded-full bg-chart-3/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-chart-3 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.servicesInProgress}
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.servicesCompletedToday} completed today`}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Upcoming Maintenance</CardTitle>
            <Wrench className="w-5 h-5 text-chart-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-8 w-16" /> : metrics?.upcomingMaintenance}
            </div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">
              {isLoading ? <Skeleton className="h-4 w-24" /> : `${metrics?.overdueMaintenance} overdue`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Vehicle Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              {isLoadingUtilization ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <LineChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} vertical={false} />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                  <YAxis stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ stroke: 'var(--color-muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-chart-1)" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Maintenance Cost Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={maintenanceCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                <YAxis stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  cursor={{ stroke: 'var(--color-muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="var(--color-chart-5)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profitability per Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} vertical={false} />
              <XAxis dataKey="vehicle" stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
              <YAxis stroke="var(--color-muted-foreground)" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
              />
              <Bar dataKey="profit" fill="var(--color-chart-2)" radius={[6, 6, 6, 6]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm bg-card/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Vehicle</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Driver</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAssignments ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-border/50">
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-2 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    recentAssignments?.map((assignment) => (
                      <TableRow key={assignment.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-sm">{assignment.id}</TableCell>
                        <TableCell className="text-sm">{assignment.vehicleName}</TableCell>
                        <TableCell className="text-sm">{assignment.driverName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assignment.status === "Completed"
                                ? "default"
                                : assignment.status === "Active"
                                ? "secondary"
                                : "outline"
                            }
                            className="rounded-md font-normal"
                          >
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${assignment.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{assignment.progress}%</span>
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

        <Card className="border-border/50 shadow-sm bg-card/50 h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                    className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors duration-200 border border-transparent hover:border-border/50"
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
                    <div className="text-sm text-foreground leading-snug">{alert.message}</div>
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