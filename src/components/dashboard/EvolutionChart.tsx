import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

type EvolutionEntry = { month: string; saldo: number };

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function EvolutionChart() {
  const [data, setData] = useState<EvolutionEntry[]>([]);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startStr = start.toISOString().split("T")[0];

    Promise.all([
      supabase.from("accounts").select("balance").neq("type", "credit"),
      supabase
        .from("transactions")
        .select("amount, type, date")
        .gte("date", startStr),
    ]).then(([accRes, txRes]) => {
      const totalBalance = (accRes.data || []).reduce(
        (s, a) => s + (a.balance || 0),
        0,
      );
      const rows = txRes.data || [];

      // build monthly net flow (most recent first)
      const monthNet: Record<string, number> = {};
      const months: { key: string; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthNet[key] = 0;
        months.push({ key, label: MONTH_LABELS[d.getMonth()] });
      }
      for (const row of rows) {
        const key = row.date.slice(0, 7);
        if (monthNet[key] !== undefined) {
          monthNet[key] += row.type === "income" ? row.amount : -row.amount;
        }
      }

      // reconstruct balance going backwards from current balance
      const entries: EvolutionEntry[] = [];
      let runningBalance = totalBalance;
      for (let i = months.length - 1; i >= 0; i--) {
        entries.unshift({
          month: months[i].label,
          saldo: Math.round(runningBalance),
        });
        runningBalance -= monthNet[months[i].key];
      }
      setData(entries);
    });
  }, []);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Evolucao Patrimonial
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(268,65%,55%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(268,65%,55%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(240,6%,90%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(240,5%,46%)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(240,5%,46%)" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="hsl(268,65%,55%)"
              strokeWidth={2.5}
              fill="url(#colorSaldo)"
              name="Saldo"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
