import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AppLayout() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const [userName, setUserName] = useState("Usuário");
  const [userInitial, setUserInitial] = useState("U");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name =
        data.user?.user_metadata?.name || data.user?.email || "Usuário";
      setUserName(name.split(" ")[0]);
      setUserInitial(name.charAt(0).toUpperCase());
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border bg-card px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {greeting},{" "}
                  <span className="font-semibold text-foreground">
                    {userName}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Search className="h-[18px] w-[18px]" />
              </button>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
                {userInitial}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
