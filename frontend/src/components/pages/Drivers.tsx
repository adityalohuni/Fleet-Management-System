import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
import { Search, Plus, AlertCircle, User, Loader2, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from "../../hooks/useDrivers";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { Driver } from "../../types";

export function Drivers() {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [availability, setAvailability] = useState<"Available" | "On Duty" | "Off Duty">("Available");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { data: drivers, isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();

  const resetForm = () => {
    setName("");
    setLicense("");
    setAvailability("Available");
    setPhone("");
    setEmail("");
    setEditingId(null);
  };

  const handleOpenDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEditClick = (driver: Driver) => {
    setName(driver.name);
    setLicense(driver.license);
    setAvailability(driver.availability);
    setPhone(driver.phone);
    setEmail(driver.email);
    setEditingId(driver.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDriver.mutateAsync({
          id: editingId,
          data: {
            name,
            license,
            availability,
            phone,
            email,
          }
        });
        toast.success("Driver updated successfully");
      } else {
        await createDriver.mutateAsync({
          name,
          license,
          availability,
          phone,
          email,
          licenseExpiry: "2026-01-01", // Default for now
          hoursThisWeek: 0,
          wageRate: 25,
        });
        toast.success("Driver created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingId ? "Failed to update driver" : "Failed to create driver");
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriver.mutateAsync(id);
        toast.success("Driver deleted successfully");
        if (selectedDriverId === id) {
          setSelectedDriverId(null);
        }
      } catch (error) {
        toast.error("Failed to delete driver");
      }
    }
  };

  const selectedDriver = drivers?.find((d) => d.id === selectedDriverId);
  const isSubmitting = createDriver.isPending || updateDriver.isPending;

  // Check if license expires within 30 days (mock logic for now as we don't have real expiry dates from backend yet)
  const isLicenseExpiringSoon = (expiry: string) => {
    const expiryDate = new Date(expiry);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-2">Driver Management</h1>
          <p className="text-muted-foreground">Manage driver profiles, schedules, and assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Driver" : "Add New Driver"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Number</label>
                <Input 
                  placeholder="DL-XXXXXXX" 
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={availability} onValueChange={(val: any) => setAvailability(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="On Duty">On Duty</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  placeholder="(555) 123-4567" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  placeholder="driver@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Update Driver" : "Create Driver"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Driver Roster</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search drivers..." className="pl-9 w-64" />
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
                  <TableHead>Driver</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hours (Week)</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers?.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-xs text-muted-foreground">Rate: ${driver.wageRate}/hr</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {driver.license}
                        {isLicenseExpiringSoon(driver.licenseExpiry) && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          driver.availability === "Available"
                            ? "default"
                            : driver.availability === "On Duty"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          driver.availability === "Available"
                            ? "bg-chart-2"
                            : driver.availability === "On Duty"
                            ? "bg-chart-1"
                            : "bg-chart-3"
                        }
                      >
                        {driver.availability}
                      </Badge>
                    </TableCell>
                    <TableCell>{driver.hoursThisWeek} hrs</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{driver.phone}</div>
                        <div className="text-muted-foreground">{driver.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDriverId(driver.id)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(driver)}
                          aria-label="Edit driver"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteDriver(driver.id)}
                          aria-label="Delete driver"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {drivers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No drivers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDriverId} onOpenChange={(open) => !open && setSelectedDriverId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Driver Details - {selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div>
                <div className="text-sm text-muted-foreground mb-1">License</div>
                <div className="text-foreground">{selectedDriver?.license}</div>
             </div>
             <div>
                <div className="text-sm text-muted-foreground mb-1">License Expiry</div>
                <div className="text-foreground">{selectedDriver?.licenseExpiry}</div>
             </div>
             <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="text-foreground">{selectedDriver?.availability}</div>
             </div>
             <div>
                <div className="text-sm text-muted-foreground mb-1">Wage Rate</div>
                <div className="text-foreground">${selectedDriver?.wageRate}/hr</div>
             </div>
             <div>
                <div className="text-sm text-muted-foreground mb-1">Phone</div>
                <div className="text-foreground">{selectedDriver?.phone}</div>
             </div>
             <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="text-foreground">{selectedDriver?.email}</div>
             </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Assignment History</h3>
            <div className="text-center py-8 text-muted-foreground border rounded-md">
                Assignment history not yet connected to backend
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
