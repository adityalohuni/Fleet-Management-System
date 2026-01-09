import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeStyle = 'modern' | 'utilitarian';

interface ThemeStyleContextType {
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
}

const ThemeStyleContext = createContext<ThemeStyleContextType | undefined>(undefined);

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme-style');
      return (stored as ThemeStyle) || 'modern';
    }
    return 'modern';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both theme classes first
    root.classList.remove('theme-modern', 'theme-utilitarian');
    
    // Add the selected theme class
    root.classList.add(`theme-${themeStyle}`);
    
    // Store preference
    localStorage.setItem('theme-style', themeStyle);
  }, [themeStyle]);

  const setThemeStyle = (style: ThemeStyle) => {
    setThemeStyleState(style);
  };

  return (
    <ThemeStyleContext.Provider value={{ themeStyle, setThemeStyle }}>
      {children}
    </ThemeStyleContext.Provider>
  );
}

export function useThemeStyle() {
  const context = useContext(ThemeStyleContext);
  if (context === undefined) {
    throw new Error('useThemeStyle must be used within a ThemeStyleProvider');
  }
  return context;
}
