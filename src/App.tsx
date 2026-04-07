import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Contas from "./pages/Contas";
import Cartoes from "./pages/Cartoes";
import Goals from "./pages/Goals";
import Calendario from "./pages/Calendario";
import Relatorios from "./pages/Relatorios";
import Alertas from "./pages/Alertas";
import Configuracoes from "./pages/Configuracoes";
import Privacidade from "./pages/Privacidade";
import Dividas from "./pages/Dividas";
import Cobrancas from "./pages/Cobrancas";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      },
    );
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  if (!session) return <Index />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/transacoes" element={<Transactions />} />
            <Route path="/contas" element={<Contas />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/metas" element={<Goals />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/dividas" element={<Dividas />} />
            <Route path="/cobrancas" element={<Cobrancas />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
