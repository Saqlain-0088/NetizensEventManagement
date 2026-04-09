import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { EventProvider } from "@/context/EventContext";
import { MasterDataProvider } from "@/context/MasterDataContext";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import AddEnquiry from "./pages/AddEnquiry";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MasterDataProvider>
          <EventProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/events" element={<Events />} />
                <Route path="/add-enquiry" element={<AddEnquiry />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </EventProvider>
        </MasterDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
