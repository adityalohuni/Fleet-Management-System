import { Truck } from "lucide-react";

export function AuthLogo() {
  return (
    <div className="flex justify-center">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
        <div className="relative flex items-center justify-center w-24 h-24 bg-primary rounded-2xl ring-4 ring-primary/20 p-3" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <Truck className="w-12 h-12 text-primary-foreground drop-shadow-2xl" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
