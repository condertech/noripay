// importações de mock removidas para uso do Supabase
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";

type Transaction = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  category_icon?: string;
  account?: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  recurrent: boolean;
};

export function RecentTransactions() {
  const [recent, setRecent] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(6);
      if (!error && data) setRecent(data);
    }
    fetchTransactions();
  }, []);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">
          Ultimas Transacoes
        </h3>
        <a
          href="/transacoes"
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver todas
        </a>
      </div>
      <div className="space-y-1">
        {recent.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  tx.type === "income"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {tx.type === "income" ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {tx.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.category} · {formatDate(tx.date)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                tx.type === "income" ? "text-success" : "text-foreground",
              )}
            >
              {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
