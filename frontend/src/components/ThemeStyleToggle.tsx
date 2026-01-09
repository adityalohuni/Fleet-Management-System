import { Palette, Grid3x3, Sparkles, Check } from "lucide-react";
import { useThemeStyle } from "../contexts/ThemeStyleContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const themeOptions = [
  {
    value: 'modern' as const,
    label: 'Modern',
    icon: Palette,
    description: 'Glassmorphism with smooth animations',
  },
  {
    value: 'utilitarian' as const,
    label: 'Utilitarian',
    icon: Grid3x3,
    description: 'Brutalist, functional design',
  },
  // Future themes can be added here:
  // {
  //   value: 'cyberpunk',
  //   label: 'Cyberpunk',
  //   icon: Sparkles,
  //   description: 'Neon colors and futuristic vibes',
  // },
];

export function ThemeStyleToggle() {
  const { themeStyle, setThemeStyle } = useThemeStyle();
  const currentTheme = themeOptions.find(t => t.value === themeStyle) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-secondary rounded-full transition-all duration-200">
          <CurrentIcon className="h-5 w-5" />
          <span className="sr-only">Change theme style</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Style</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((theme) => {
          const Icon = theme.icon;
          const isActive = themeStyle === theme.value;
          return (
            <DropdownMenuItem
              key={theme.value}
              onSelect={() => setThemeStyle(theme.value)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1">
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{theme.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {theme.description}
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
