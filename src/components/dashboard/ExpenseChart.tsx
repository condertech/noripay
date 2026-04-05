import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#a3e635",
  "#818cf8",
  "#34d399",
  "#f472b6",
  "#fb923c",
];

type CategoryEntry = { name: string; value: number; color: string };

export function ExpenseChart() {
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryEntry[]>([]);

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    supabase
      .from("transactions")
      .select("amount, category")
      .eq("type", "expense")
      .gte("date", firstDay)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, number> = {};
        for (const row of data) {
          const cat = row.category || "Outros";
          map[cat] = (map[cat] || 0) + row.amount;
        }
        const entries = Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value], i) => ({
            name,
            value,
            color: COLORS[i % COLORS.length],
          }));
        setCategoryExpenses(entries);
      });
  }, []);

  const total = categoryExpenses.reduce((s, c) => s + c.value, 0);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Despesas por Categoria
      </h3>
      {categoryExpenses.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Sem despesas este mês
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categoryExpenses.slice(0, 5).map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-medium tabular-nums text-foreground">
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
