import { Bell, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
  return (
    <div className="h-16 flex items-center justify-between px-8 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <button className="p-1 hover:bg-secondary rounded-md transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-1 hover:bg-secondary rounded-md transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 hover:bg-secondary rounded-full transition-all duration-200">
              <Bell className="w-5 h-5 text-foreground" />
              <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-destructive rounded-full border-2 border-background" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass border-border p-2">
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              <div className="flex flex-col gap-1">
                <div className="font-medium text-sm">Maintenance Due</div>
                <div className="text-xs text-muted-foreground">
                  Vehicle TRK-101 requires service in 2 days
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              <div className="flex flex-col gap-1">
                <div className="font-medium text-sm">License Expiring</div>
                <div className="text-xs text-muted-foreground">
                  Driver John Smith's license expires next week
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              <div className="flex flex-col gap-1">
                <div className="font-medium text-sm">Service Completed</div>
                <div className="text-xs text-muted-foreground">
                  Delivery #SRV-2345 marked as delivered
                </div>
              </div>
            </DropdownMenuItem>
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
            <DropdownMenuItem className="rounded-lg cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}