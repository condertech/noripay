import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate, formatCurrency } from "@/lib/utils";
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
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchBills = async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("id, name, due_date, amount")
        .order("due_date", { ascending: true })
        .limit(3);
      if (!error) setBills(data || []);
    };
    fetchBills();
  }, []);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground">
        Contas a pagar
      </h3>
      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{bill.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatDate(bill.due_date)}
              </span>
            </div>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(bill.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
