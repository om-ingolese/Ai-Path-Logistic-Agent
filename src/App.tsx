import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/lib/index";
import Home from "@/pages/Home";
import LoginOperator from "@/pages/LoginOperator";
import LoginDriver from "@/pages/LoginDriver";
import LoginSupplier from "@/pages/LoginSupplier";
import Dashboard from "@/pages/Dashboard";
import Fleet from "@/pages/Fleet";
import Loads from "@/pages/Loads";
import Analytics from "@/pages/Analytics";
import Support from "@/pages/Support";
import LiveTracking from "@/pages/LiveTracking";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton richColors />
        <BrowserRouter>
          <Routes>
            <Route path={ROUTE_PATHS.HOME} element={<Home />} />

            <Route path={ROUTE_PATHS.LOGIN_OPERATOR} element={<LoginOperator />} />
            <Route path={ROUTE_PATHS.LOGIN_DRIVER} element={<LoginDriver />} />
            <Route path={ROUTE_PATHS.LOGIN_SUPPLIER} element={<LoginSupplier />} />

            <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTE_PATHS.FLEET} element={<Fleet />} />
            <Route path={ROUTE_PATHS.LOADS} element={<Loads />} />
            <Route path={ROUTE_PATHS.ANALYTICS} element={<Analytics />} />
            <Route path={ROUTE_PATHS.SUPPORT} element={<Support />} />
            <Route path={ROUTE_PATHS.LIVE_TRACKING} element={<LiveTracking />} />

            <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;