import { UserCircle } from "lucide-react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="role" className="text-sm font-semibold">
        Role
      </Label>
      <div className="relative flex items-center border border-input rounded-md px-3">
        <UserCircle className="text-muted-foreground pointer-events-none z-10 mr-2 w-5 h-5" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="role" className="border-0 focus:ring-0 focus:outline-none h-auto py-2">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="Driver" className="rounded-lg py-3">Driver</SelectItem>
            <SelectItem value="Manager" className="rounded-lg py-3">Manager</SelectItem>
            <SelectItem value="Mechanic" className="rounded-lg py-3">Mechanic</SelectItem>
            <SelectItem value="Admin" className="rounded-lg py-3">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
