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
    <div className="w-64 bg-background/95 backdrop-blur-xl border-r border-border h-screen flex flex-col sticky top-0 z-40">
      <div className="px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">FleetMaster</span>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-secondary/50 text-sm px-3 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-primary/50 outline-none placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            FM
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Fleet Manager</div>
            <div className="text-xs text-muted-foreground truncate">admin@fleet.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}