import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

type MonthEntry = { month: string; receitas: number; despesas: number };

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

export function MonthlyChart() {
  const [data, setData] = useState<MonthEntry[]>([]);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startStr = start.toISOString().split("T")[0];

    supabase
      .from("transactions")
      .select("amount, type, date")
      .gte("date", startStr)
      .then(({ data: rows }) => {
        if (!rows) return;
        const map: Record<string, MonthEntry> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          map[key] = {
            month: MONTH_LABELS[d.getMonth()],
            receitas: 0,
            despesas: 0,
          };
        }
        for (const row of rows) {
          const key = row.date.slice(0, 7);
          if (map[key]) {
            if (row.type === "income") map[key].receitas += row.amount;
            else map[key].despesas += row.amount;
          }
        }
        setData(Object.values(map));
      });
  }, []);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Receitas vs Despesas
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
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
            <Bar
              dataKey="receitas"
              fill="hsl(152,60%,42%)"
              radius={[6, 6, 0, 0]}
              name="Receitas"
            />
            <Bar
              dataKey="despesas"
              fill="hsl(268,65%,55%)"
              radius={[6, 6, 0, 0]}
              name="Despesas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
