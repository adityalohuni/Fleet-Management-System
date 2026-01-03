import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";

export function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage system preferences and configurations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input defaultValue="FleetMaster Pro" />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input defaultValue="admin@fleetmaster.com" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label>Time Zone</Label>
                  <Input defaultValue="UTC-05:00 (EST)" />
                </div>
              </div>
              <Separator />
              <div>
                <Label>Address</Label>
                <Input defaultValue="123 Fleet Street, Transport City, TC 12345" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Distance Unit</div>
                  <div className="text-sm text-slate-500">Choose between miles or kilometers</div>
                </div>
                <select className="border border-slate-300 rounded-lg px-3 py-2">
                  <option>Miles</option>
                  <option>Kilometers</option>
                </select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Currency</div>
                  <div className="text-sm text-slate-500">Default currency for financial reports</div>
                </div>
                <select className="border border-slate-300 rounded-lg px-3 py-2">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Date Format</div>
                  <div className="text-sm text-slate-500">How dates are displayed</div>
                </div>
                <select className="border border-slate-300 rounded-lg px-3 py-2">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Maintenance Alerts</div>
                  <div className="text-sm text-slate-500">
                    Receive alerts when maintenance is due or overdue
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">License Expiry Warnings</div>
                  <div className="text-sm text-slate-500">
                    Get notified when driver licenses are expiring soon
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Service Completion</div>
                  <div className="text-sm text-slate-500">
                    Alerts when services are marked as completed
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Payment Notifications</div>
                  <div className="text-sm text-slate-500">
                    Updates on payment status changes
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Desktop Notifications</div>
                  <div className="text-sm text-slate-500">
                    Show browser notifications for important alerts
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Weekly Summary Report</div>
                  <div className="text-sm text-slate-500">
                    Receive weekly fleet performance summary via email
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="text-slate-900">Admin User</div>
                    <div className="text-sm text-slate-500">admin@fleetmaster.com</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">Fleet Manager</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <div className="text-slate-900">Operations Manager</div>
                    <div className="text-sm text-slate-500">ops@fleetmaster.com</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">Dispatcher</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-slate-900">Google Maps API</div>
                  <div className="text-sm text-slate-500">Route optimization and tracking</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-slate-900">Payment Gateway</div>
                  <div className="text-sm text-slate-500">Process service payments</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-slate-900">SMS Notifications</div>
                  <div className="text-sm text-slate-500">Send SMS alerts to drivers</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
