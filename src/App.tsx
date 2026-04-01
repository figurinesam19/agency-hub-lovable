import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { CreationView } from "./pages/CreationView";
import SuiviEditorialView from "./pages/SuiviEditorialView";
import CalendrierView from "./pages/CalendrierView";
import AnalyticsView from "./pages/AnalyticsView";
import PipelineCrmView from "./pages/PipelineCrmView";
import AbonnementsView from "./pages/AbonnementsView";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/suivi-editorial" replace />} />
              <Route path="/creation" element={<CreationView />} />
              <Route path="/suivi-editorial" element={<SuiviEditorialView />} />
              <Route path="/calendrier" element={<CalendrierView />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/crm" element={<PipelineCrmView />} />
              <Route path="/abonnements" element={<AbonnementsView />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
