import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { useEffect, useMemo, useState } from "react";
import { useAppSettings, useCreateUser, useUpdateAppSettings, useUpdateUser, useUsers } from "../../hooks/useSettings";
import { Skeleton } from "../ui/skeleton";
import type { UpdateAppSettingsDto } from "../../dto/settings.dto";

export function Settings() {
  const { data: settings, isLoading, isError } = useAppSettings();
  const { data: users, isLoading: isUsersLoading } = useUsers();
  const updateSettings = useUpdateAppSettings();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState<UpdateAppSettingsDto | null>(null);

  useEffect(() => {
    if (!settings) return;
    setForm({
      company_name: settings.company_name,
      contact_email: settings.contact_email,
      phone_number: settings.phone_number,
      time_zone: settings.time_zone,
      address: settings.address,
      distance_unit: settings.distance_unit,
      currency: settings.currency,
      date_format: settings.date_format,
      notify_maintenance_alerts: settings.notify_maintenance_alerts,
      notify_license_expiry: settings.notify_license_expiry,
      notify_service_completion: settings.notify_service_completion,
      notify_payment: settings.notify_payment,
      notify_sms: settings.notify_sms,
      notify_desktop: settings.notify_desktop,
      notify_weekly_summary: settings.notify_weekly_summary,
    });
  }, [settings]);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "Driver",
    is_active: true,
  });

  const [userEdits, setUserEdits] = useState<Record<string, { role: string; is_active: boolean }>>({});

  useEffect(() => {
    if (!users) return;
    setUserEdits(
      Object.fromEntries(users.map((u) => [u.id, { role: u.role, is_active: u.is_active }]))
    );
  }, [users]);

  const canSave = useMemo(() => !!form && !updateSettings.isPending, [form, updateSettings.isPending]);

  const onSaveCompany = async () => {
    if (!form) return;
    await updateSettings.mutateAsync(form);
  };

  const updateField = <K extends keyof UpdateAppSettingsDto>(key: K, value: UpdateAppSettingsDto[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Settings</h1>
          <p className="text-base text-foreground-secondary">Manage system preferences and configurations</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {isError && (
            <div className="text-sm text-destructive">
              Failed to load settings.
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground font-medium">Company Name</Label>
                  {isLoading || !form ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input value={form.company_name} onChange={(e) => updateField('company_name', e.target.value)} />
                  )}
                </div>
                <div>
                  <Label className="text-foreground font-medium">Contact Email</Label>
                  {isLoading || !form ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input type="email" value={form.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} />
                  )}
                </div>
                <div>
                  <Label className="text-foreground font-medium">Phone Number</Label>
                  {isLoading || !form ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input type="tel" value={form.phone_number} onChange={(e) => updateField('phone_number', e.target.value)} />
                  )}
                </div>
                <div>
                  <Label className="text-foreground font-medium">Time Zone</Label>
                  {isLoading || !form ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input value={form.time_zone} onChange={(e) => updateField('time_zone', e.target.value)} />
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-foreground font-medium">Address</Label>
                {isLoading || !form ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                )}
              </div>
              <div className="flex justify-end">
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={onSaveCompany} disabled={!canSave}>
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
                  <div className="text-foreground font-medium">Distance Unit</div>
                  <div className="text-sm text-foreground-tertiary">Choose between miles or kilometers</div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-10 w-40" />
                ) : (
                  <select
                    className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                    value={form.distance_unit}
                    onChange={(e) => {
                      const next = e.target.value;
                      const nextForm = { ...form, distance_unit: next };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  >
                    <option value="Miles">Miles</option>
                    <option value="Kilometers">Kilometers</option>
                  </select>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground font-medium">Currency</div>
                  <div className="text-sm text-foreground-tertiary">Default currency for financial reports</div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-10 w-40" />
                ) : (
                  <select
                    className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                    value={form.currency}
                    onChange={(e) => {
                      const next = e.target.value;
                      const nextForm = { ...form, currency: next };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground font-medium">Date Format</div>
                  <div className="text-sm text-foreground-tertiary">How dates are displayed</div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-10 w-40" />
                ) : (
                  <select
                    className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                    value={form.date_format}
                    onChange={(e) => {
                      const next = e.target.value;
                      const nextForm = { ...form, date_format: next };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                )}
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
                  <div className="text-foreground">Maintenance Alerts</div>
                  <div className="text-sm text-foreground-secondary">
                    Receive alerts when maintenance is due or overdue
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_maintenance_alerts}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_maintenance_alerts: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground">License Expiry Warnings</div>
                  <div className="text-sm text-foreground-secondary">
                    Get notified when driver licenses are expiring soon
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_license_expiry}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_license_expiry: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground">Service Completion</div>
                  <div className="text-sm text-foreground-secondary">
                    Alerts when services are marked as completed
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_service_completion}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_service_completion: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground">Payment Notifications</div>
                  <div className="text-sm text-foreground-secondary">
                    Updates on payment status changes
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_payment}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_payment: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground">SMS Notifications</div>
                  <div className="text-sm text-foreground-secondary">
                    Send SMS alerts for critical events
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_sms}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_sms: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
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
                  <div className="text-foreground">Desktop Notifications</div>
                  <div className="text-sm text-foreground-secondary">
                    Show browser notifications for important alerts
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_desktop}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_desktop: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-foreground">Weekly Summary Report</div>
                  <div className="text-sm text-foreground-secondary">
                    Receive weekly fleet performance summary via email
                  </div>
                </div>
                {isLoading || !form ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <Switch
                    checked={form.notify_weekly_summary}
                    onCheckedChange={(checked) => {
                      const nextForm = { ...form, notify_weekly_summary: checked };
                      setForm(nextForm);
                      updateSettings.mutate(nextForm);
                    }}
                  />
                )}
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
                <div className="p-4 border border-border rounded-lg space-y-4">
                  <div className="text-foreground font-medium">Add New User</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium">Password</Label>
                      <Input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium">Role</Label>
                      <select
                        className="border border-border rounded-lg px-3 py-2 bg-background text-foreground w-full"
                        value={newUser.role}
                        onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Driver">Driver</option>
                        <option value="Mechanic">Mechanic</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-foreground font-medium">Active</div>
                        <div className="text-sm text-foreground-secondary">Allow this user to sign in</div>
                      </div>
                      <Switch
                        checked={newUser.is_active}
                        onCheckedChange={(checked) => setNewUser((p) => ({ ...p, is_active: checked }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      disabled={!newUser.email || !newUser.password || createUser.isPending}
                      onClick={async () => {
                        await createUser.mutateAsync(newUser);
                        setNewUser({ email: "", password: "", role: "Driver", is_active: true });
                      }}
                    >
                      Add New User
                    </Button>
                  </div>
                </div>

                {isUsersLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))
                ) : (
                  users?.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border border-border rounded-lg gap-4">
                      <div className="min-w-0">
                        <div className="text-foreground truncate">{u.email}</div>
                        <div className="text-sm text-foreground-secondary">{userEdits[u.id]?.is_active ? 'Active' : 'Inactive'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          className="border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                          value={userEdits[u.id]?.role ?? u.role}
                          onChange={(e) => {
                            const nextRole = e.target.value;
                            setUserEdits((prev) => ({
                              ...prev,
                              [u.id]: { role: nextRole, is_active: prev[u.id]?.is_active ?? u.is_active },
                            }));
                          }}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Driver">Driver</option>
                          <option value="Mechanic">Mechanic</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground-tertiary">Active</span>
                          <Switch
                            checked={userEdits[u.id]?.is_active ?? u.is_active}
                            onCheckedChange={(checked) => {
                              setUserEdits((prev) => ({
                                ...prev,
                                [u.id]: { role: prev[u.id]?.role ?? u.role, is_active: checked },
                              }));
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateUser.isPending}
                          onClick={() => {
                            const dto = userEdits[u.id] ?? { role: u.role, is_active: u.is_active };
                            updateUser.mutate({ id: u.id, dto });
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="text-foreground">Google Maps API</div>
                  <div className="text-sm text-foreground-secondary">Route optimization and tracking</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="text-foreground">Payment Gateway</div>
                  <div className="text-sm text-foreground-secondary">Process service payments</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="text-foreground">SMS Notifications</div>
                  <div className="text-sm text-foreground-secondary">Send SMS alerts to drivers</div>
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
