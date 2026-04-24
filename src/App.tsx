import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getRouterMode, isSupabaseConfigured } from "@/lib/runtimeConfig";
import Index from "./pages/Index";
import FindParking from "./pages/FindParking";
import CarTransition from "./pages/CarTransition";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ParkingDetail from "./pages/ParkingDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const Router = getRouterMode() === "hash" ? HashRouter : BrowserRouter;
const showConfigNotice = !isSupabaseConfigured();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        {showConfigNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-900">
            Supabase is not configured correctly. Add valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values in `.env` or your deployment environment to enable login, bookings, and live data.
          </div>
        )}
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/drive" element={<CarTransition />} />
            <Route path="/find-parking" element={<FindParking />} />
            <Route path="/parking/:id" element={<ParkingDetail />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
