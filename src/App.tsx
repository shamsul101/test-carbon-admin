import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { routes, AppRoute } from "./routesConfig";
import { DashboardLayout } from "./components/DashboardLayout";
import { RequireAuth } from "./components/RequireAuth";
import { RequireRole } from "./components/RequireRole";
import { useAuthStore } from "./store/auth";
import DashboardPage from "./app/(dashboard)/dashboard/page";

const queryClient = new QueryClient();

const getLayout = (route: AppRoute, element: JSX.Element) => {
  if (route.layout === "dashboard") {
    const wrapped = route.roles ? (
      <RequireRole allowedRoles={route.roles}>{element}</RequireRole>
    ) : (
      element
    );
    return (
      <RequireAuth>
        <DashboardLayout>{wrapped}</DashboardLayout>
      </RequireAuth>
    );
  }
  return element;
};

const AppContent = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initializing authentication
    const initialize = async () => {
      try {
        // auth initialization function
        await initializeAuth();
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, [initializeAuth]);

  // Show loading spinner while initializing auth or during auth operations
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root route - redirect based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />

        {/* Other routes */}
        {routes
          .filter((route) => route.path !== "/") // Exclude root route as we handle it above
          .map((route, idx) => (
            <Route
              key={idx}
              path={route.path}
              element={getLayout(route, <route.component />)}
            />
          ))}

        {/* Add unauthorized route */}
        <Route
          path="/unauthorized"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
                <p className="mt-2">You don't have permission to access this page.</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;