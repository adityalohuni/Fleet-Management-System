
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from "./App.tsx";
import { queryClient } from './lib/query-client';
import { OpenAPI } from './client';
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeStyleProvider } from "./contexts/ThemeStyleContext";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import "./styles/typography.css";
import "./styles/utilitarian.css";

// Configure API Client
OpenAPI.BASE = ''; // Paths in openapi.json already include /api
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('token') || '';
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeStyleProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </ThemeStyleProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);  