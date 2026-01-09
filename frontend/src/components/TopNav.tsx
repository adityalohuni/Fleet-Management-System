import { Bell, X, AlertCircle, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeStyleToggle } from "./ThemeStyleToggle";
import { useAlerts, useResolveAlert } from "../hooks/useMaintenance";
import { getAlertMessage, getAlertTimeAgo, getSeverityBadgeColor } from "../lib/alertHelpers";
import { toast } from "../lib/toast";

interface TopNavProps {
  onNavigate?: (page: string) => void;
}

export function TopNav({ onNavigate }: TopNavProps) {
  const { data: alerts = [], isLoading } = useAlerts();
  const resolveAlert = useResolveAlert();

  const unresolvedAlerts = alerts.filter(a => !a.isResolved);
  const hasAlerts = unresolvedAlerts.length > 0;

  const handleResolveAlert = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await resolveAlert.mutateAsync(alertId);
      toast.success('Alert resolved');
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  return (
    <div className="h-16 flex items-center justify-between pl-8 pr-12 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center gap-4">
      </div>

      <div className="flex items-center gap-4">
        <ThemeStyleToggle />
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 hover:bg-secondary rounded-full transition-all duration-200">
              <Bell className="w-5 h-5 text-foreground" />
              {hasAlerts && (
                <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-destructive rounded-full border-2 border-background" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 glass border-border p-2 max-h-[500px] overflow-y-auto">
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold flex items-center justify-between">
              <span>Notifications</span>
              {hasAlerts && (
                <Badge variant="secondary" className="ml-2">
                  {unresolvedAlerts.length}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : unresolvedAlerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No unresolved alerts
              </div>
            ) : (
              unresolvedAlerts.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="rounded-lg cursor-pointer flex items-start gap-3 p-3 focus:bg-secondary/50"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm">{getAlertMessage(alert)}</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeverityBadgeColor(alert.severity)}`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getAlertTimeAgo(alert.createdAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleResolveAlert(alert.id, e)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-secondary pl-1 pr-3 py-1 rounded-full transition-all duration-200 border border-transparent hover:border-border">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium leading-none">Admin</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-border p-1">
            <DropdownMenuLabel className="px-2 py-1.5">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer"
              onSelect={() => onNavigate?.('settings')}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
              onSelect={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}