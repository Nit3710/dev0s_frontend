import { Toaster } from "@/components/ui/toaster";
import { SonnerToaster } from "@/components/ui/sonner-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/pages/login/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { WorkspacePage } from "@/pages/workspace/WorkspacePage";
import { ActivityPage } from "@/pages/activity/ActivityPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { useAuthStore } from "@/state/auth.store";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication on app startup
    console.log("app renderingggg..........")
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* App Routes - Protected */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/workspace/:projectId" element={<WorkspacePage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
