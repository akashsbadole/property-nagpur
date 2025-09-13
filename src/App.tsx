import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityMiddleware } from "@/middleware/SecurityMiddleware";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";
import MobileApp from "./pages/mobile/MobileApp";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { BrokerPanel } from "./pages/broker/BrokerPanel";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityMiddleware>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {isMobile ? (
                <MobileApp />
              ) : (
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/properties" element={<Properties />} />
                      <Route path="/property/:id" element={<PropertyDetail />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/broker" element={<BrokerPanel />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              )}
            </BrowserRouter>
          </TooltipProvider>
        </SecurityMiddleware>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;