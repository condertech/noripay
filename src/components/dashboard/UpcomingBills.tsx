// importações de mock removidas para uso do Supabase
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  paid: { icon: CheckCircle2, label: "Pago", className: "text-success" },
  pending: { icon: Clock, label: "Pendente", className: "text-warning" },
  overdue: {
    icon: AlertCircle,
    label: "Atrasado",
    className: "text-destructive",
  },
};

export function UpcomingBills() {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Proximos Vencimentos
      </h3>
      <div className="space-y-1">
        {bills.map((bill) => {
          const status = statusConfig[bill.status];
          const StatusIcon = status.icon;
          return (
            <div
              key={bill.id}
              className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <StatusIcon className={cn("h-4 w-4", status.className)} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {bill.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vence em {formatDate(bill.dueDate)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(bill.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
