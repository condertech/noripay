import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  Target,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transacoes", url: "/transacoes", icon: ArrowLeftRight },
  { title: "Contas", url: "/contas", icon: Wallet },
  { title: "Cartoes", url: "/cartoes", icon: CreditCard },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Dívidas", url: "/dividas", icon: AlertTriangle },
  { title: "Cobranças", url: "/cobrancas", icon: Receipt },
];

const secondaryNav = [
  { title: "Calendario", url: "/calendario", icon: CalendarDays },
  { title: "Relatorios", url: "/relatorios", icon: BarChart3 },
  { title: "Alertas", url: "/alertas", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">
              V
            </span>
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground tracking-tight">
              NORIPAY
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-medium px-4">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-10 rounded-lg transition-all duration-200"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-medium px-4">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-10 rounded-lg transition-all duration-200"
                  >
                    <NavLink
                      to={item.url}
                      end
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/configuracoes")}
              className="h-10 rounded-lg transition-all duration-200"
            >
              <NavLink
                to="/configuracoes"
                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              >
                <Settings className="h-[18px] w-[18px]" />
                {!collapsed && <span>Configurações</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 rounded-lg text-destructive hover:text-destructive"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
