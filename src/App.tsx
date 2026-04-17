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
import { useAuth } from "@/context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import AddEnquiry from "./pages/AddEnquiry";
import NotFound from "./pages/NotFound";
import MastersHub from "./pages/masters/MastersHub";
import PropertyMaster from "./pages/masters/PropertyMaster";
import RoleMaster from "./pages/masters/RoleMaster";
import HallMaster from "./pages/masters/HallMaster";
import PackageMaster from "./pages/masters/PackageMaster";
import MenuMaster from "./pages/masters/MenuMaster";
import ExtrasMaster from "./pages/masters/ExtrasMaster";
import UserMaster from "./pages/masters/UserMaster";

const queryClient = new QueryClient();

// Wrap a single page in ProtectedRoute + AppLayout
const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const AdminProtected = ({ children }: { children: React.ReactNode }) => {
  const { user, roles } = useAuth();
  const role = roles.find(r => r.id === user?.roleId);
  const isAdmin = role?.permissions.canView && role?.permissions.canAdd && role?.permissions.canEdit && role?.permissions.canDelete;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Protected>{children}</Protected>;
};

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

                  {/* Redirect root to login if not handled */}
                  <Route path="/" element={<Protected><Dashboard /></Protected>} />
                  <Route path="/events" element={<Protected><Events /></Protected>} />
                  <Route path="/add-enquiry" element={<Protected><AddEnquiry /></Protected>} />
                  <Route path="/edit-enquiry/:id" element={<Protected><AddEnquiry /></Protected>} />
                  <Route path="/masters" element={<AdminProtected><MastersHub /></AdminProtected>} />
                  <Route path="/masters/properties" element={<AdminProtected><PropertyMaster /></AdminProtected>} />
                  <Route path="/masters/roles" element={<AdminProtected><RoleMaster /></AdminProtected>} />
                  <Route path="/masters/halls" element={<AdminProtected><HallMaster /></AdminProtected>} />
                  <Route path="/masters/packages" element={<AdminProtected><PackageMaster /></AdminProtected>} />
                  <Route path="/masters/menu" element={<AdminProtected><MenuMaster /></AdminProtected>} />
                  <Route path="/masters/extras" element={<AdminProtected><ExtrasMaster /></AdminProtected>} />
                  <Route path="/masters/users" element={<AdminProtected><UserMaster /></AdminProtected>} />
                  <Route path="*" element={<NotFound />} />
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
