import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  ClipboardList, 
  MapPin, 
  Wrench, 
  DollarSign, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "vehicles", label: "Vehicles", icon: Truck },
    { id: "drivers", label: "Drivers", icon: Users },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "services", label: "Services", icon: MapPin },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "financial", label: "Financial Reports", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 glass border-r border-border h-screen flex flex-col sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-foreground">FleetMaster</div>
            <div className="text-xs text-muted-foreground">Pro</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-sidebar-accent-foreground" : ""}`} />
              <span className={isActive ? "font-medium" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">Version 1.0.0</div>
      </div>
    </div>
  );
}