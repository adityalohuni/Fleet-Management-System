import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Search, MapPin, CheckCircle2, Circle, Navigation, Package, DollarSign, User, Plus } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { CreateServiceDialog } from "./CreateServiceDialog";

export function Services() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: services = [], isLoading, isError, refetch } = useServices();

  const service = services.find((s) => s.id === selectedService);

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(
      (s) =>
        s.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const progress = useMemo(() => {
    if (!service) return null;

    const stages = ["Scheduled", "In Progress", "Delivered", "Paid"] as const;
    const completedIdx = (() => {
      if (service.paymentStatus === "Paid") return 3;
      if (service.paymentStatus === "Invoiced") return 2;
      if (service.status === "Delivered") return 2;
      if (service.status === "In Progress") return 1;
      return 0;
    })();

    return stages.map((stage, idx) => ({ stage, completed: idx <= completedIdx }));
  }, [service]);

  const totals = useMemo(() => {
    const revenue = services.reduce((sum, s) => sum + (s.serviceFee || 0), 0);
    const knownCosts = services.reduce((sum, s) => sum + (s.cost ?? 0), 0);
    const pendingPayments = services
      .filter((s) => s.paymentStatus !== "Paid")
      .reduce((sum, s) => sum + (s.serviceFee || 0), 0);
    return { revenue, knownCosts, pendingPayments };
  }, [services]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="page-header mb-2">Transport Services</h1>
          <p className="page-subtitle">Track and manage transport service operations</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Service
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground-tertiary">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-foreground">${totals.revenue.toLocaleString()}</div>
            )}
            <p className="text-xs text-foreground-tertiary mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground-tertiary">Total Costs</CardTitle>
            </CardHeader>
            <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-foreground">${totals.knownCosts.toLocaleString()}</div>
            )}
            <p className="text-xs text-foreground-tertiary mt-1">Known costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground-tertiary">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-green-600">
                ${(totals.revenue - totals.knownCosts).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-foreground-tertiary mt-1">Based on known costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground-tertiary">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-foreground">${totals.pendingPayments.toLocaleString()}</div>
            )}
            <p className="text-xs text-foreground-tertiary mt-1">
              {isLoading ? "" : `${services.filter((s) => s.paymentStatus !== "Paid").length} service(s)`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary w-4 h-4" />
              <Input 
                placeholder="Search by client, ID, or location..." 
                className="pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <div className="text-sm text-destructive mb-4">
              Failed to load services.
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Load Type</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-foreground-tertiary">
                    No services found
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-accent/50 cursor-pointer">
                    <TableCell className="font-mono text-sm">{service.id.slice(0, 8)}...</TableCell>
                    <TableCell>{service.client}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{service.origin}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{service.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{service.loadType}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${service.serviceFee.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          service.status === "Delivered"
                            ? "default"
                            : service.status === "In Progress"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          service.status === "Delivered"
                            ? "bg-green-500"
                            : service.status === "In Progress"
                            ? "bg-blue-500"
                            : ""
                        }
                      >
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.paymentStatus === "Paid" ? "default" : "outline"}
                        className={service.paymentStatus === "Paid" ? "bg-green-500" : ""}
                      >
                        {service.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedService(service.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details - {service?.id.slice(0, 12)}...</DialogTitle>
          </DialogHeader>
          
          {service && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="route">Route</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-foreground-tertiary mb-2">Date</div>
                    <div className="text-foreground">{service.date}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground-tertiary mb-2">Load Type</div>
                    <Badge variant="outline">{service.loadType}</Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground-tertiary mb-2">Assigned Vehicle</div>
                    <div className="text-foreground">{service.assignedVehicle ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground-tertiary mb-2">Assigned Driver</div>
                    <div className="text-foreground">{service.assignedDriver ?? "—"}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Service Progress</h4>
                  <div className="flex items-center gap-2">
                    {progress?.map((stage, index) => (
                      <div key={stage.stage} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          {stage.completed ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                          ) : (
                            <Circle className="w-8 h-8 text-foreground-tertiary mb-2" />
                          )}
                          <div className="text-xs text-foreground-tertiary text-center">{stage.stage}</div>
                        </div>
                        {index < (progress?.length || 0) - 1 && (
                          <div
                            className={`flex-1 h-0.5 -mt-6 ${
                              stage.completed ? "bg-green-500" : "bg-foreground-tertiary"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Payment Status</h4>
                    <Badge
                      className={service.paymentStatus === "Paid" ? "bg-green-500" : "bg-orange-500"}
                    >
                      {service.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-sm text-foreground-secondary bg-background/50 p-3 rounded-lg mt-2">
                    {service.paymentStatus === "Paid"
                      ? "✓ Payment received and confirmed."
                      : service.paymentStatus === "Pending"
                      ? "Awaiting payment confirmation from client."
                      : "Invoice sent to client, awaiting payment."}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="route" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-foreground-tertiary uppercase tracking-wider">Origin</div>
                        <div className="text-foreground font-mono">{service.origin}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center text-foreground-tertiary mb-4">
                      <div className="flex-1 h-px bg-border" />
                      <Navigation className="w-4 h-4 mx-2" />
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-secondary mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-foreground-tertiary uppercase tracking-wider">Destination</div>
                        <div className="text-foreground font-mono">{service.destination}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-400">
                    💡 <strong>Note:</strong> Route optimization and map visualization coming in the next update. Currently showing coordinate pairs.
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-background/50 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Client Information</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-foreground-tertiary uppercase tracking-wider mb-1">Client Name</div>
                        <div className="text-foreground">{service.client}</div>
                      </div>
                      <Separator />
                      <div className="text-sm text-foreground-secondary italic">
                        Additional customer details (contact, address) would be loaded from the logistics API.
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div className="text-xs text-foreground-tertiary">Service Fee</div>
                      </div>
                      <div className="text-2xl font-bold text-foreground">${service.serviceFee.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-red-600" />
                        <div className="text-xs text-foreground-tertiary">Total Cost</div>
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {service.cost == null ? "—" : `$${service.cost.toLocaleString()}`}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div className="text-xs text-foreground-tertiary">Net Profit</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {service.cost == null ? "—" : `$${(service.serviceFee - service.cost).toLocaleString()}`}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Profit Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {service.cost == null ? (
                      <div className="text-sm text-foreground-tertiary italic">
                        Costs not yet recorded. Profit will be calculated once maintenance and operational costs are logged.
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue</span>
                          <span className="font-semibold">${service.serviceFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Costs</span>
                          <span className="font-semibold">-${service.cost.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-green-600 text-base font-bold">
                          <span>Net Profit</span>
                          <span>${(service.serviceFee - service.cost).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <CreateServiceDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
