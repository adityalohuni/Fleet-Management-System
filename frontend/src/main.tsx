
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from "./App.tsx";
import { queryClient } from './lib/query-client';
import { OpenAPI } from './client';
import "./index.css";

// Configure API Client
OpenAPI.BASE = ''; // Paths in openapi.json already include /api
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('token') || '';
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);  