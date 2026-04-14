import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { EventProvider } from "@/context/EventContext";
import { MasterDataProvider } from "@/context/MasterDataContext";
import { BanquetMasterProvider } from "@/context/BanquetMasterContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import AddEnquiry from "./pages/AddEnquiry";
import NotFound from "./pages/NotFound";
import MastersHub from "./pages/masters/MastersHub";
import HallMaster from "./pages/masters/HallMaster";
import PackageMaster from "./pages/masters/PackageMaster";
import MenuMaster from "./pages/masters/MenuMaster";
import ExtrasMaster from "./pages/masters/ExtrasMaster";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MasterDataProvider>
            <BanquetMasterProvider>
              <EventProvider>
                <Routes>
                  {/* Public */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected — all wrapped in AppLayout */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/events" element={<Events />} />
                          <Route path="/add-enquiry" element={<AddEnquiry />} />
                          <Route path="/masters" element={<MastersHub />} />
                          <Route path="/masters/halls" element={<HallMaster />} />
                          <Route path="/masters/packages" element={<PackageMaster />} />
                          <Route path="/masters/menu" element={<MenuMaster />} />
                          <Route path="/masters/extras" element={<ExtrasMaster />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </EventProvider>
            </BanquetMasterProvider>
          </MasterDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
