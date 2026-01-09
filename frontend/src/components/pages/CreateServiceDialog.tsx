import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ServicesService } from '../../services/services.service';
import type { CustomerDto } from '../../dto/services.dto';
import { AlertCircle, Loader2 } from 'lucide-react';

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  // Step 1: Customer
  customerId: string;
  customerName: string;
  customerContact: string;
  customerAddress: string;
  createNewCustomer: boolean;

  // Step 2: Route
  originLat: string;
  originLng: string;
  destinationLat: string;
  destinationLng: string;

  // Step 3: Shipment
  loadType: string;
  weight: string;
  dimensionsLength: string;
  dimensionsWidth: string;
  dimensionsHeight: string;

  // Step 4: Price
  agreedPrice: string;
}

const initialFormData: FormData = {
  customerId: '',
  customerName: '',
  customerContact: '',
  customerAddress: '',
  createNewCustomer: false,
  originLat: '',
  originLng: '',
  destinationLat: '',
  destinationLng: '',
  loadType: 'Package',
  weight: '',
  dimensionsLength: '',
  dimensionsWidth: '',
  dimensionsHeight: '',
  agreedPrice: '',
};

export function CreateServiceDialog({ open, onOpenChange, onSuccess }: CreateServiceDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Load customers on dialog open
  useEffect(() => {
    if (open && customers.length === 0) {
      loadCustomers();
    }
  }, [open]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await ServicesService.listCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 1) {
      if (formData.createNewCustomer) {
        if (!formData.customerName.trim()) {
          setError('Customer name is required');
          return false;
        }
        if (!formData.customerAddress.trim()) {
          setError('Billing address is required');
          return false;
        }
      } else {
        if (!formData.customerId) {
          setError('Please select a customer');
          return false;
        }
      }
      return true;
    }

    if (step === 2) {
      if (!formData.originLat.trim() || !formData.originLng.trim()) {
        setError('Origin coordinates are required');
        return false;
      }
      if (!formData.destinationLat.trim() || !formData.destinationLng.trim()) {
        setError('Destination coordinates are required');
        return false;
      }
      // Validate numbers
      if (isNaN(parseFloat(formData.originLat)) || isNaN(parseFloat(formData.originLng))) {
        setError('Origin coordinates must be valid numbers');
        return false;
      }
      if (
        isNaN(parseFloat(formData.destinationLat)) ||
        isNaN(parseFloat(formData.destinationLng))
      ) {
        setError('Destination coordinates must be valid numbers');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.loadType.trim()) {
        setError('Load type is required');
        return false;
      }
      if (!formData.weight.trim()) {
        setError('Weight is required');
        return false;
      }
      if (isNaN(parseFloat(formData.weight))) {
        setError('Weight must be a valid number');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.agreedPrice.trim()) {
        setError('Agreed price is required');
        return false;
      }
      if (isNaN(parseFloat(formData.agreedPrice))) {
        setError('Agreed price must be a valid number');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Create or select customer
      let selectedCustomerId = formData.customerId;
      if (formData.createNewCustomer) {
        const newCustomer = await ServicesService.createCustomer({
          name: formData.customerName,
          contact_info: { phone: formData.customerContact },
          billing_address: formData.customerAddress,
        });
        selectedCustomerId = newCustomer.id;
      }

      // Step 2: Create transport job
      const job = await ServicesService.createJob({
        customer_id: selectedCustomerId,
        status: 'Pending',
        agreed_price: formData.agreedPrice,
      });

      // Step 3: Create route
      const origin = {
        type: 'Point',
        coordinates: [parseFloat(formData.originLng), parseFloat(formData.originLat)],
      };
      const destination = {
        type: 'Point',
        coordinates: [parseFloat(formData.destinationLng), parseFloat(formData.destinationLat)],
      };

      await ServicesService.createRoute({
        job_id: job.id,
        origin,
        destination,
        waypoints: null,
      });

      // Step 4: Create shipment
      await ServicesService.createShipment({
        job_id: job.id,
        weight: parseFloat(formData.weight),
        dimensions: {
          length: formData.dimensionsLength ? parseFloat(formData.dimensionsLength) : null,
          width: formData.dimensionsWidth ? parseFloat(formData.dimensionsWidth) : null,
          height: formData.dimensionsHeight ? parseFloat(formData.dimensionsHeight) : null,
        },
        type: formData.loadType,
      });

      // Success: reset form and close
      setFormData(initialFormData);
      setCurrentStep(1);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to create service:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create service. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
          <DialogDescription>
            Add a new transport service by filling out the details step by step.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step-1" disabled={currentStep < 1}>
              Customer
            </TabsTrigger>
            <TabsTrigger value="step-2" disabled={currentStep < 2}>
              Route
            </TabsTrigger>
            <TabsTrigger value="step-3" disabled={currentStep < 3}>
              Shipment
            </TabsTrigger>
            <TabsTrigger value="step-4" disabled={currentStep < 4}>
              Price
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Customer */}
          <TabsContent value="step-1" className="space-y-4 mt-4">
            <div>
              <Label className="mb-3 block">Customer Selection</Label>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={formData.createNewCustomer ? 'outline' : 'default'}
                  onClick={() => handleInputChange('createNewCustomer', false)}
                  className="flex-1"
                >
                  Select Existing
                </Button>
                <Button
                  variant={formData.createNewCustomer ? 'default' : 'outline'}
                  onClick={() => handleInputChange('createNewCustomer', true)}
                  className="flex-1"
                >
                  Create New
                </Button>
              </div>

              {formData.createNewCustomer ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="Company or individual name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerContact">Contact Information</Label>
                    <Input
                      id="customerContact"
                      placeholder="Phone or email"
                      value={formData.customerContact}
                      onChange={(e) => handleInputChange('customerContact', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAddress">Billing Address *</Label>
                    <Input
                      id="customerAddress"
                      placeholder="Full address"
                      value={formData.customerAddress}
                      onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="customerId">Select Customer *</Label>
                  {loadingCustomers ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-foreground-tertiary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading customers...
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="p-2 text-sm text-foreground-tertiary">
                      No customers available. Create a new one instead.
                    </div>
                  ) : (
                    <Select value={formData.customerId} onValueChange={(val) => handleInputChange('customerId', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Step 2: Route */}
          <TabsContent value="step-2" className="space-y-4 mt-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
              💡 <strong>Note:</strong> Enter GPS coordinates. For example: latitude 40.7128, longitude
              -74.0060
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originLat">Origin Latitude *</Label>
                <Input
                  id="originLat"
                  type="number"
                  step="0.00001"
                  placeholder="e.g., 40.7128"
                  value={formData.originLat}
                  onChange={(e) => handleInputChange('originLat', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="originLng">Origin Longitude *</Label>
                <Input
                  id="originLng"
                  type="number"
                  step="0.00001"
                  placeholder="e.g., -74.0060"
                  value={formData.originLng}
                  onChange={(e) => handleInputChange('originLng', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destinationLat">Destination Latitude *</Label>
                <Input
                  id="destinationLat"
                  type="number"
                  step="0.00001"
                  placeholder="e.g., 40.7580"
                  value={formData.destinationLat}
                  onChange={(e) => handleInputChange('destinationLat', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="destinationLng">Destination Longitude *</Label>
                <Input
                  id="destinationLng"
                  type="number"
                  step="0.00001"
                  placeholder="e.g., -73.9855"
                  value={formData.destinationLng}
                  onChange={(e) => handleInputChange('destinationLng', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Step 3: Shipment */}
          <TabsContent value="step-3" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="loadType">Load Type *</Label>
              <Select value={formData.loadType} onValueChange={(val) => handleInputChange('loadType', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="Freight">Freight</SelectItem>
                  <SelectItem value="Pallet">Pallet</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Liquid">Liquid</SelectItem>
                  <SelectItem value="Hazmat">Hazmat</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 100"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>

            <div>
              <Label className="block mb-2">Dimensions (optional)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="dimLength" className="text-xs text-foreground-tertiary">
                    Length (cm)
                  </Label>
                  <Input
                    id="dimLength"
                    type="number"
                    step="0.1"
                    placeholder="Length"
                    value={formData.dimensionsLength}
                    onChange={(e) => handleInputChange('dimensionsLength', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dimWidth" className="text-xs text-foreground-tertiary">
                    Width (cm)
                  </Label>
                  <Input
                    id="dimWidth"
                    type="number"
                    step="0.1"
                    placeholder="Width"
                    value={formData.dimensionsWidth}
                    onChange={(e) => handleInputChange('dimensionsWidth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dimHeight" className="text-xs text-foreground-tertiary">
                    Height (cm)
                  </Label>
                  <Input
                    id="dimHeight"
                    type="number"
                    step="0.1"
                    placeholder="Height"
                    value={formData.dimensionsHeight}
                    onChange={(e) => handleInputChange('dimensionsHeight', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Step 4: Price */}
          <TabsContent value="step-4" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="agreedPrice">Agreed Price ($) *</Label>
              <Input
                id="agreedPrice"
                type="number"
                step="0.01"
                placeholder="e.g., 1500.00"
                value={formData.agreedPrice}
                onChange={(e) => handleInputChange('agreedPrice', e.target.value)}
              />
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-700 dark:text-green-400">
              ✓ All information complete. Click "Create Service" to finalize the service creation.
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </Button>
            )}

            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Service'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
