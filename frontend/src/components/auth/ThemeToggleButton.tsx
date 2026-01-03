import { Moon, Sun } from "lucide-react";

interface ThemeToggleButtonProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggleButton({ theme, onToggle }: ThemeToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-8 right-8 p-4 rounded-xl glass hover:bg-muted transition-all duration-200 group z-20"
      aria-label="Toggle theme"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 w-5 h-5 text-chart-3 transition-all duration-300 ${
          theme === "light" 
            ? "rotate-0 scale-100 opacity-100" 
            : "rotate-90 scale-0 opacity-0"
        }`} />
        <Moon className={`absolute inset-0 w-5 h-5 text-primary transition-all duration-300 ${
          theme === "dark" 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        }`} />
      </div>
    </button>
  );
}
