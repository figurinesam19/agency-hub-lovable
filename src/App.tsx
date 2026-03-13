import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/Layout";
import CreationView from "./pages/CreationView";
import SuiviEditorialView from "./pages/SuiviEditorialView";
import CalendrierView from "./pages/CalendrierView";
import AnalyticsView from "./pages/AnalyticsView";
import PipelineCrmView from "./pages/PipelineCrmView";
import AbonnementsView from "./pages/AbonnementsView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
