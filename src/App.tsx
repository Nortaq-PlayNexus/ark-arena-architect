import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import MasterLayout from "@/layouts/MasterLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const ClusterDashboardPage = lazy(() => import("@/modules/cluster/ClusterDashboardPage"));
const ToolkitPage = lazy(() => import("@/modules/toolkit/ToolkitPage"));
const IniLibraryPage = lazy(() => import("@/pages/IniLibraryPage"));
const MasterCompanionsPage = lazy(() => import("@/pages/MasterCompanionsPage"));
const MasterSettingsPage = lazy(() => import("@/pages/MasterSettingsPage"));
const MasterDiagnosticsPage = lazy(() => import("@/pages/MasterDiagnosticsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingScreen = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground" role="status">
    Loading module…
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route element={<MasterLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/cluster" element={<ClusterDashboardPage />} />
                <Route path="/toolkit" element={<ToolkitPage />} />
                <Route path="/ini" element={<IniLibraryPage />} />
                <Route path="/companions" element={<MasterCompanionsPage />} />
                <Route path="/settings" element={<MasterSettingsPage />} />
                <Route path="/diagnostics" element={<MasterDiagnosticsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
