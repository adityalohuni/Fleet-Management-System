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
import { Search, MapPin, CheckCircle2, Circle } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { Skeleton } from "../ui/skeleton";

export function Services() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const { data: services = [], isLoading, isError } = useServices();

  const service = services.find((s) => s.id === selectedService);

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Transport Services</h1>
          <p className="text-base text-foreground-secondary">Track and manage transport service operations</p>
        </div>
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
              <Input placeholder="Search services..." className="pl-9 w-64" />
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
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                : services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.id}</TableCell>
                      <TableCell>{service.client}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-foreground-tertiary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="text-foreground-secondary">{service.origin}</div>
                            <div className="text-foreground-tertiary">→ {service.destination}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{service.loadType}</TableCell>
                      <TableCell>${service.serviceFee}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            service.status === "Delivered"
                              ? "bg-green-500"
                              : service.status === "In Progress"
                              ? "bg-blue-500"
                              : "bg-slate-500"
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
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details - {service?.id}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Client</div>
                <div className="text-foreground">{service?.client}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Date</div>
                <div className="text-foreground">{service?.date}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Origin</div>
                <div className="text-foreground">{service?.origin}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Destination</div>
                <div className="text-foreground">{service?.destination}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Assigned Vehicle</div>
                <div className="text-foreground">{service?.assignedVehicle ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Assigned Driver</div>
                <div className="text-foreground">{service?.assignedDriver ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Load Type</div>
                <div className="text-foreground">{service?.loadType}</div>
              </div>
              <div>
                <div className="text-sm text-foreground-tertiary mb-1">Status</div>
                <Badge
                  className={
                    service?.status === "Delivered"
                      ? "bg-green-500"
                      : service?.status === "In Progress"
                      ? "bg-blue-500"
                      : "bg-slate-500"
                  }
                >
                  {service?.status}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="text-foreground mb-4">Service Progress</h3>
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

            <div>
              <h3 className="text-foreground mb-4">Financial Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground-tertiary mb-1">Service Fee</div>
                    <div className="text-foreground">${service?.serviceFee}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground-tertiary mb-1">Total Cost</div>
                    <div className="text-foreground">{service?.cost == null ? "—" : `$${service.cost}`}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground-tertiary mb-1">Net Profit</div>
                    <div className="text-green-600">
                      {service?.cost == null ? "—" : `$${service.serviceFee - service.cost}`}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-foreground">Payment Status</h3>
                <Badge
                  className={service?.paymentStatus === "Paid" ? "bg-green-500" : "bg-orange-500"}
                >
                  {service?.paymentStatus}
                </Badge>
              </div>
              <div className="text-sm text-foreground-secondary bg-background/50 p-4 rounded-lg">
                {service?.paymentStatus === "Paid"
                  ? "Payment received and confirmed."
                  : service?.paymentStatus === "Pending"
                  ? "Awaiting payment confirmation from client."
                  : "Invoice sent to client, awaiting payment."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
