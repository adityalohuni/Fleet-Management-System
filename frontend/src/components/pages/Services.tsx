import { useState } from "react";
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
import { Search, MapPin, DollarSign, CheckCircle2, Circle } from "lucide-react";
import { Progress } from "../ui/progress";

const services = [
  {
    id: "SRV-1234",
    client: "ABC Logistics Inc.",
    origin: "Downtown Warehouse",
    destination: "Industrial Park Zone B",
    loadType: "General Cargo",
    serviceFee: 850,
    cost: 420,
    paymentStatus: "Paid",
    status: "Delivered",
    assignedVehicle: "TRK-101",
    assignedDriver: "John Smith",
    date: "2025-11-04",
  },
  {
    id: "SRV-1235",
    client: "Global Shipping Co.",
    origin: "Port Terminal",
    destination: "City Center Distribution",
    loadType: "Electronics",
    serviceFee: 1200,
    cost: 580,
    paymentStatus: "Pending",
    status: "In Progress",
    assignedVehicle: "TRK-103",
    assignedDriver: "Mike Davis",
    date: "2025-11-05",
  },
  {
    id: "SRV-1236",
    client: "FastMove Distributors",
    origin: "Airport Cargo Terminal",
    destination: "Suburban Depot",
    loadType: "Perishables",
    serviceFee: 950,
    cost: 460,
    paymentStatus: "Paid",
    status: "In Progress",
    assignedVehicle: "VAN-201",
    assignedDriver: "Sarah Johnson",
    date: "2025-11-05",
  },
  {
    id: "SRV-1237",
    client: "BuildRight Construction",
    origin: "Supply Yard A",
    destination: "Construction Site 45",
    loadType: "Building Materials",
    serviceFee: 1100,
    cost: 520,
    paymentStatus: "Invoiced",
    status: "Scheduled",
    assignedVehicle: "TRK-102",
    assignedDriver: "Emma Wilson",
    date: "2025-11-06",
  },
];

const serviceProgress = {
  "SRV-1234": [
    { stage: "Scheduled", completed: true },
    { stage: "In Progress", completed: true },
    { stage: "Delivered", completed: true },
    { stage: "Paid", completed: true },
  ],
  "SRV-1235": [
    { stage: "Scheduled", completed: true },
    { stage: "In Progress", completed: true },
    { stage: "Delivered", completed: false },
    { stage: "Paid", completed: false },
  ],
};

export function Services() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const service = services.find((s) => s.id === selectedService);
  const progress = selectedService ? serviceProgress[selectedService as keyof typeof serviceProgress] : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Transport Services</h1>
          <p className="text-slate-600">Track and manage transport service operations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">$4,100</div>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">$1,980</div>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">$2,120</div>
            <p className="text-xs text-slate-500 mt-1">51.7% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">$1,200</div>
            <p className="text-xs text-slate-500 mt-1">1 service</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search services..." className="pl-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.id}</TableCell>
                  <TableCell>{service.client}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div>{service.origin}</div>
                        <div className="text-slate-500">→ {service.destination}</div>
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
                <div className="text-sm text-slate-600 mb-1">Client</div>
                <div className="text-slate-900">{service?.client}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Date</div>
                <div className="text-slate-900">{service?.date}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Origin</div>
                <div className="text-slate-900">{service?.origin}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Destination</div>
                <div className="text-slate-900">{service?.destination}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Assigned Vehicle</div>
                <div className="text-slate-900">{service?.assignedVehicle}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Assigned Driver</div>
                <div className="text-slate-900">{service?.assignedDriver}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Load Type</div>
                <div className="text-slate-900">{service?.loadType}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Status</div>
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
              <h3 className="text-slate-900 mb-4">Service Progress</h3>
              <div className="flex items-center gap-2">
                {progress?.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      {stage.completed ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                      ) : (
                        <Circle className="w-8 h-8 text-slate-300 mb-2" />
                      )}
                      <div className="text-xs text-slate-600 text-center">{stage.stage}</div>
                    </div>
                    {index < (progress?.length || 0) - 1 && (
                      <div
                        className={`flex-1 h-0.5 -mt-6 ${
                          stage.completed ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-slate-900 mb-4">Financial Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-600 mb-1">Service Fee</div>
                    <div className="text-slate-900">${service?.serviceFee}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-600 mb-1">Total Cost</div>
                    <div className="text-slate-900">${service?.cost}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-600 mb-1">Net Profit</div>
                    <div className="text-green-600">
                      ${service ? service.serviceFee - service.cost : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-900">Payment Status</h3>
                <Badge
                  className={service?.paymentStatus === "Paid" ? "bg-green-500" : "bg-orange-500"}
                >
                  {service?.paymentStatus}
                </Badge>
              </div>
              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
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
