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
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Filter, Plus, Loader2, Trash2, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useVehicles, useCreateVehicle, useDeleteVehicle, useUpdateVehicle, useVehicleMaintenance } from "../../hooks/useVehicles";
import { useAssignmentsByVehicle } from "../../hooks/useAssignments";
import { Skeleton } from "../ui/skeleton";
import { toast, formatApiError } from "../../lib/toast";
import { Vehicle } from "../../types";
import { validateVehicleForm } from "../../lib/validation";

export function Vehicles() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("Truck");
  const [newVehicleStatus, setNewVehicleStatus] = useState("Available");

  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const { data: maintenanceHistory, isLoading: isMaintLoading } = useVehicleMaintenance(selectedVehicleId || "");
  const { data: assignments, isLoading: isAssignmentsLoading } = useAssignmentsByVehicle(selectedVehicleId || "");

  const resetForm = () => {
    setNewVehicleModel("");
    setNewVehicleType("Truck");
    setNewVehicleStatus("Available");
    setEditingId(null);
    setValidationErrors({});
  };

  const handleOpenDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setNewVehicleModel(vehicle.model);
    setNewVehicleType(vehicle.type);
    setNewVehicleStatus(vehicle.status);
    setEditingId(vehicle.id);
    setValidationErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateVehicleForm({
      model: newVehicleModel,
      type: newVehicleType,
      status: newVehicleStatus,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    const toastId = toast.loading(editingId ? 'Updating vehicle...' : 'Creating vehicle...');
    
    try {
      if (editingId) {
        await updateVehicle.mutateAsync({
          id: editingId,
          data: {
            model: newVehicleModel,
            type: newVehicleType,
            status: newVehicleStatus as any,
          }
        });
        toast.update(toastId, 'success', "Vehicle updated successfully");
      } else {
        await createVehicle.mutateAsync({
          model: newVehicleModel,
          type: newVehicleType,
          status: newVehicleStatus as any,
          mileage: 0,
          lastService: new Date().toISOString(),
          utilization: 0
        });
        toast.update(toastId, 'success', "Vehicle created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = formatApiError(error, editingId ? "Failed to update vehicle" : "Failed to create vehicle");
      toast.update(toastId, 'error', errorMessage);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      const toastId = toast.loading('Deleting vehicle...');
      try {
        await deleteVehicle.mutateAsync(id);
        toast.update(toastId, 'success', "Vehicle deleted successfully");
        if (selectedVehicleId === id) {
          setSelectedVehicleId(null);
        }
      } catch (error) {
        const errorMessage = formatApiError(error, "Failed to delete vehicle");
        toast.update(toastId, 'error', errorMessage);
      }
    }
  };

  const filteredVehicles = vehicles?.filter((v) =>
    filterStatus === "all" ? true : v.status === filterStatus
  );

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);
  const isSubmitting = createVehicle.isPending || updateVehicle.isPending;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="page-header mb-2">Vehicles</h1>
          <p className="page-subtitle">Manage fleet vehicles and track maintenance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full px-6" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Model *</label>
                <Input 
                  placeholder="e.g. Ford F-150" 
                  value={newVehicleModel}
                  onChange={(e) => {
                    setNewVehicleModel(e.target.value);
                    if (validationErrors.model) {
                      setValidationErrors({...validationErrors, model: ''});
                    }
                  }}
                  className={validationErrors.model ? 'border-red-500' : ''}
                />
                {validationErrors.model && <p className="text-sm text-red-500">{validationErrors.model}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <Select value={newVehicleType} onValueChange={(val) => {
                  setNewVehicleType(val);
                  if (validationErrors.type) {
                    setValidationErrors({...validationErrors, type: ''});
                  }
                }}>
                  <SelectTrigger className={validationErrors.type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.type && <p className="text-sm text-red-500">{validationErrors.type}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <Select value={newVehicleStatus} onValueChange={(val) => {
                  setNewVehicleStatus(val);
                  if (validationErrors.status) {
                    setValidationErrors({...validationErrors, status: ''});
                  }
                }}>
                  <SelectTrigger className={validationErrors.status ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.status && <p className="text-sm text-red-500">{validationErrors.status}</p>}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Update Vehicle" : "Create Vehicle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Fleet</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary w-4 h-4" />
                <Input placeholder="Search vehicles..." className="pl-9 w-64" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles?.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.id}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          vehicle.status === "Available"
                            ? "default"
                            : vehicle.status === "Assigned"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          vehicle.status === "Available"
                            ? "bg-chart-2"
                            : vehicle.status === "Assigned"
                            ? "bg-chart-1"
                            : "bg-chart-3"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
                    <TableCell>{new Date(vehicle.lastService).toLocaleDateString()}</TableCell>
                    <TableCell>{vehicle.utilization}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVehicleId(vehicle.id)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(vehicle)}
                          aria-label="Edit vehicle"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          aria-label="Delete vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVehicles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-foreground-secondary">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedVehicleId} onOpenChange={(open) => !open && setSelectedVehicleId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vehicle Details - {selectedVehicle?.id}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Model</div>
                  <div className="text-foreground">{selectedVehicle?.model}</div>
                </div>
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Type</div>
                  <div className="text-foreground">{selectedVehicle?.type}</div>
                </div>
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Status</div>
                  <Badge
                    className={
                      selectedVehicle?.status === "Available"
                        ? "bg-chart-2"
                        : selectedVehicle?.status === "Assigned"
                        ? "bg-chart-1"
                        : "bg-chart-3"
                    }
                  >
                    {selectedVehicle?.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Utilization Rate</div>
                  <div className="text-foreground">{selectedVehicle?.utilization}%</div>
                </div>
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Mileage</div>
                  <div className="text-foreground">{selectedVehicle?.mileage.toLocaleString()} miles</div>
                </div>
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Last Service Date</div>
                  <div className="text-foreground">{selectedVehicle?.lastService ? new Date(selectedVehicle.lastService).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-foreground-tertiary mb-1">Next Maintenance</div>
                  <div className="text-foreground">50,000 miles or 2025-12-15</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance">
              {isMaintLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : maintenanceHistory && maintenanceHistory.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceHistory.map((record: any, idx: number) => (
                    <div key={idx} className="border border-border rounded p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-foreground-tertiary">Type</div>
                          <div className="text-foreground font-medium">{record.type || record.maintenance_type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-foreground-tertiary">Date</div>
                          <div className="text-foreground">{new Date(record.date || record.maintenance_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {record.description && (
                        <div>
                          <div className="text-sm text-foreground-tertiary">Description</div>
                          <div className="text-foreground">{record.description}</div>
                        </div>
                      )}
                      {(record.cost || record.maintenance_cost) && (
                        <div>
                          <div className="text-sm text-foreground-tertiary">Cost</div>
                          <div className="text-foreground">${(parseFloat(record.cost || record.maintenance_cost || "0") || 0).toFixed(2)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground-secondary">
                  No maintenance records available
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/30 transition-colors cursor-pointer">
                  <div className="text-sm text-foreground-secondary">Drag and drop documents or click to upload</div>
                  <div className="text-xs text-foreground-tertiary mt-1">Supported: PDF, JPG, PNG (Max 10MB)</div>
                </div>
                <div className="text-center py-8 text-foreground-secondary">
                  <p className="mb-2">No documents uploaded yet</p>
                  <p className="text-xs">Upload registration, insurance, maintenance logs, and other vehicle documents</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignments">
              {isAssignmentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : assignments && assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment: any) => (
                    <div key={assignment.id} className="border border-border rounded p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-foreground-tertiary">Driver ID</div>
                          <div className="text-foreground font-medium">{assignment.driverId}</div>
                        </div>
                        <Badge
                          className={
                            assignment.status === "Active"
                              ? "bg-chart-2"
                              : assignment.status === "Completed"
                              ? "bg-chart-1"
                              : "bg-chart-3"
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-foreground-tertiary">Start</div>
                          <div className="text-foreground">{new Date(assignment.startDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-foreground-tertiary">End</div>
                          <div className="text-foreground">
                            {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Ongoing'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground-secondary">
                  No assignments for this vehicle
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
