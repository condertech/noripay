import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, CheckCircle2, Bell } from "lucide-react";

type AlertItem = {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "overdue" | "pending" | "upcoming";
  source: "transaction" | "bill";
  description?: string;
};

export default function Alertas() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    Promise.all([
      // Overdue transactions
      supabase
        .from("transactions")
        .select("id, title, amount, date, status")
        .eq("status", "overdue")
        .order("date", { ascending: false })
        .limit(10),
      // Pending transactions past due
      supabase
        .from("transactions")
        .select("id, title, amount, date, status")
        .eq("status", "pending")
        .lt("date", today)
        .order("date", { ascending: false })
        .limit(10),
      // Upcoming bills in next 7 days
      supabase
        .from("bills")
        .select("id, name, amount, due_date")
        .gte("due_date", today)
        .lte("due_date", nextWeek)
        .order("due_date", { ascending: true })
        .limit(10),
    ]).then(([overdueRes, pendingRes, billsRes]) => {
      const items: AlertItem[] = [];

      for (const tx of overdueRes.data || []) {
        items.push({
          id: `tx-${tx.id}`,
          title: tx.title,
          amount: tx.amount,
          date: tx.date,
          type: "overdue",
          source: "transaction",
        });
      }

      for (const tx of pendingRes.data || []) {
        items.push({
          id: `pending-${tx.id}`,
          title: tx.title,
          amount: tx.amount,
          date: tx.date,
          type: "pending",
          source: "transaction",
        });
      }

      for (const bill of billsRes.data || []) {
        items.push({
          id: `bill-${bill.id}`,
          title: bill.name,
          amount: bill.amount,
          date: bill.due_date,
          type: "upcoming",
          source: "bill",
          description: "Conta a vencer",
        });
      }

      // Sort: overdue first, then pending, then upcoming
      const order = { overdue: 0, pending: 1, upcoming: 2 };
      items.sort(
        (a, b) => order[a.type] - order[b.type] || a.date.localeCompare(b.date),
      );

      setAlerts(items);
      setLoading(false);
    });
  }, []);

  const overdueCount = alerts.filter((a) => a.type === "overdue").length;
  const pendingCount = alerts.filter((a) => a.type === "pending").length;
  const upcomingCount = alerts.filter((a) => a.type === "upcoming").length;

  const typeConfig = {
    overdue: {
      icon: AlertCircle,
      label: "Atrasado",
      className: "text-destructive",
      bg: "bg-destructive/10",
    },
    pending: {
      icon: Clock,
      label: "Pendente vencido",
      className: "text-warning",
      bg: "bg-warning/10",
    },
    upcoming: {
      icon: Bell,
      label: "A vencer",
      className: "text-primary",
      bg: "bg-primary/10",
    },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          Alertas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fique por dentro do que precisa de atenção
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {overdueCount} atrasado{overdueCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""} vencido
              {pendingCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {upcomingCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {upcomingCount} a vencer esta semana
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Carregando alertas...</p>
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="rounded-2xl bg-card p-10 shadow-card flex flex-col items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-success opacity-60" />
          <p className="text-base font-medium text-foreground">Tudo em dia!</p>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento.
          </p>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const config = typeConfig[alert.type];
              const Icon = config.icon;
              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        config.bg,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.className)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {alert.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.date)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                            config.bg,
                            config.className,
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(alert.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
