import { StrictMode, ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { Router as AppRouter } from "./router";
import { useAuthListener } from "./hooks/useAuth";

const queryClient = new QueryClient();

function Root(): ReactElement {
  useAuthListener();
  return <AppRouter />;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>
);