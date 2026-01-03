import { Mail } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmailInput({ value, onChange }: EmailInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="email" className="text-sm font-semibold">
        Email Address
      </Label>
      <div className="relative flex items-center border border-input rounded-md px-3">
  <Mail className="text-muted-foreground pointer-events-none z-10 mr-2" />
  <Input
    type="email"
    placeholder="name@example.com"
    className="border-0 focus:ring-0 focus:outline-none"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
</div>
     
    </div>
  );
}
