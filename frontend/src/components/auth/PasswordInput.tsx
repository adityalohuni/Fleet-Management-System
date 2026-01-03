import { Lock } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PasswordInput({ value, onChange }: PasswordInputProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor="password" className="text-sm font-semibold">
        Password
      </Label>
      <div className="relative flex items-center border border-input rounded-md px-3">
        <Lock className="text-muted-foreground pointer-events-none z-10 mr-2 w-5 h-5" />
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 focus:ring-0 focus:outline-none"
        />
      </div>
    </div>
  );
}
