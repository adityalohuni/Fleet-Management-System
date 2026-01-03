import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertTriangle, Clock, Plus } from "lucide-react";
import { useAlerts, useResolveAlert, useMaintenanceRecords, useCreateMaintenanceRecord } from "../../hooks/useMaintenance";
import { useVehicles } from "../../hooks/useVehicles";
import { format } from "date-fns";
import { MaintenanceRecord } from "../../types";
import { toast, formatApiError } from "../../lib/toast";

export function Maintenance() {
  const { data: alerts } = useAlerts();
  const { data: vehicles } = useVehicles();
  const resolveAlert = useResolveAlert();
  const createRecord = useCreateMaintenanceRecord();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const { data: records } = useMaintenanceRecords(selectedVehicleId);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({
    type: "Preventive",
    date: new Date().toISOString().slice(0, 16), // datetime-local format
  });

  const handleLogService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.vehicleId || !newRecord.cost || !newRecord.provider) {
      toast.warning('Please fill in all required fields');
      return;
    }

    const toastId = toast.loading('Logging maintenance record...');

    try {
      await createRecord.mutateAsync({
        vehicleId: newRecord.vehicleId,
        type: newRecord.type || "Preventive",
        cost: Number(newRecord.cost),
        date: new Date(newRecord.date!).toISOString(),
        provider: newRecord.provider,
        description: newRecord.description,
      });
      toast.update(toastId, 'success', 'Maintenance record logged successfully');
      setIsLogOpen(false);
      setNewRecord({ type: "Preventive", date: new Date().toISOString().slice(0, 16) });
    } catch (error) {
      const errorMessage = formatApiError(error, 'Failed to log maintenance record');
      toast.update(toastId, 'error', errorMessage);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500/10 text-red-500";
      case "High": return "bg-orange-500/10 text-orange-500";
      case "Medium": return "bg-yellow-500/10 text-yellow-500";
      default: return "bg-blue-500/10 text-blue-500";
    }
  };

  const getVehicleName = (id: string) => {
    const v = vehicles?.find(v => v.id === id);
    return v ? `${v.make} ${v.model} (${v.id.slice(0, 8)})` : id;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Maintenance</h1>
          <p className="text-base text-foreground-secondary">
            Monitor fleet health and schedule services
          </p>
        </div>
        <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Maintenance Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select
                  value={newRecord.vehicleId}
                  onValueChange={(value) => setNewRecord({ ...newRecord, vehicleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.make} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newRecord.type}
                    onValueChange={(value) => setNewRecord({ ...newRecord, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preventive">Preventive</SelectItem>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Inspection">Inspection</SelectItem>
                      <SelectItem value="Accident">Accident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="0.00"
                    value={newRecord.cost}
                    onChange={(e) => setNewRecord({ ...newRecord, cost: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  placeholder="Service Provider Name"
                  value={newRecord.provider}
                  onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Details about the service"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setIsLogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Log Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts?.filter(a => !a.isResolved).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{getVehicleName(alert.entityId)}</TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert.mutate(alert.id)}
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!alerts || alerts.filter(a => !a.isResolved).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-foreground-secondary">
                      No active alerts
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label>Filter by Vehicle:</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.make} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.provider}</TableCell>
                    <TableCell className="text-right">${record.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {!selectedVehicleId && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-foreground-secondary">
                      Select a vehicle to view history
                    </TableCell>
                  </TableRow>
                )}
                {selectedVehicleId && (!records || records.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-foreground-secondary">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
