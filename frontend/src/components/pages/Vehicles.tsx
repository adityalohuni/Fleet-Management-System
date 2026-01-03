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
import { useVehicles, useCreateVehicle, useDeleteVehicle, useUpdateVehicle } from "../../hooks/useVehicles";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { Vehicle } from "../../types";

export function Vehicles() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("Truck");
  const [newVehicleStatus, setNewVehicleStatus] = useState("Available");

  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const resetForm = () => {
    setNewVehicleModel("");
    setNewVehicleType("Truck");
    setNewVehicleStatus("Available");
    setEditingId(null);
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
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle.mutateAsync({
          model: newVehicleModel,
          type: newVehicleType,
          status: newVehicleStatus as any,
          mileage: 0,
          lastService: new Date().toISOString(),
          utilization: 0
        });
        toast.success("Vehicle created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingId ? "Failed to update vehicle" : "Failed to create vehicle");
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle.mutateAsync(id);
        toast.success("Vehicle deleted successfully");
        if (selectedVehicleId === id) {
          setSelectedVehicleId(null);
        }
      } catch (error) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const filteredVehicles = vehicles?.filter((v) =>
    filterStatus === "all" ? true : v.status === filterStatus
  );

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);
  const isSubmitting = createVehicle.isPending || updateVehicle.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage fleet vehicles and track maintenance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
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
                <label className="text-sm font-medium">Model</label>
                <Input 
                  placeholder="e.g. Ford F-150" 
                  value={newVehicleModel}
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={newVehicleType} onValueChange={setNewVehicleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newVehicleStatus} onValueChange={setNewVehicleStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                  </SelectContent>
                </Select>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                  <div className="text-sm text-muted-foreground mb-1">Model</div>
                  <div className="text-foreground">{selectedVehicle?.model}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <div className="text-foreground">{selectedVehicle?.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
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
                  <div className="text-sm text-muted-foreground mb-1">Utilization Rate</div>
                  <div className="text-foreground">{selectedVehicle?.utilization}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Mileage</div>
                  <div className="text-foreground">{selectedVehicle?.mileage.toLocaleString()} miles</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Service Date</div>
                  <div className="text-foreground">{selectedVehicle?.lastService ? new Date(selectedVehicle.lastService).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Next Maintenance</div>
                  <div className="text-foreground">50,000 miles or 2025-12-15</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance">
              <div className="text-center py-8 text-muted-foreground">
                Maintenance history not yet connected to backend
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </div>
            </TabsContent>

            <TabsContent value="assignments">
              <div className="text-center py-8 text-muted-foreground">
                No assignment history available
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
