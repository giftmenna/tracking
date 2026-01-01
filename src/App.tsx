import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Track from "./pages/Track";
import Auth from "./pages/Auth.tsx";
import Services from "./pages/Services";
import Locations from "./pages/Locations";
import Support from "./pages/Support";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Shipments from "./pages/admin/Shipments";
import NewShipment from "./pages/admin/NewShipment";
import ShipmentDetails from "./pages/admin/ShipmentDetails";
import EditShipment from "./pages/admin/EditShipment";
import Customers from "./pages/admin/Customers";
import Drivers from "./pages/admin/Drivers";
import Branches from "./pages/admin/Branches";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import ScanPackage from "./pages/admin/ScanPackage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
   
<TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/track" element={<Track />} />
            <Route path="/track/:trackingNumber" element={<Track />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/services" element={<Services />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/support" element={<Support />} />

            {/* Admin Routes - Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="shipments" element={<Shipments />} />
                <Route path="shipments/new" element={<NewShipment />} />
                <Route path="shipments/:id" element={<ShipmentDetails />} />
                <Route path="shipments/:id/edit" element={<EditShipment />} />
                <Route path="customers" element={<Customers />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="branches" element={<Branches />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="scan" element={<ScanPackage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
  
  </QueryClientProvider>
);

export default App;
