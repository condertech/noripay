import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";

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

export default function Relatorios() {
  const [monthly, setMonthly] = useState<
    { month: string; receitas: number; despesas: number }[]
  >([]);
  const [byCategory, setByCategory] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      .toISOString()
      .split("T")[0];

    Promise.all([
      supabase
        .from("transactions")
        .select("amount, type, date, category")
        .gte("date", start),
      supabase.from("accounts").select("balance, type"),
    ]).then(([txRes, accRes]) => {
      const rows = txRes.data || [];

      // Monthly chart data
      const map: Record<
        string,
        { month: string; receitas: number; despesas: number }
      > = {};
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
      setMonthly(Object.values(map));

      // Expenses by category
      const catMap: Record<string, number> = {};
      for (const row of rows.filter((r) => r.type === "expense")) {
        const cat = row.category || "Outros";
        catMap[cat] = (catMap[cat] || 0) + row.amount;
      }
      const entries = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], i) => ({
          name,
          value,
          color: COLORS[i % COLORS.length],
        }));
      setByCategory(entries);

      // Income / expenses for this month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const monthRows = rows.filter((r) => r.date >= firstDay);
      const income = monthRows
        .filter((r) => r.type === "income")
        .reduce((s, r) => s + r.amount, 0);
      const expenses = monthRows
        .filter((r) => r.type === "expense")
        .reduce((s, r) => s + r.amount, 0);
      const balance = (accRes.data || [])
        .filter((a) => a.type !== "credit")
        .reduce((s, a) => s + (a.balance || 0), 0);
      setTotals({ income, expenses, balance });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          Relatórios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Análise detalhada das suas finanças
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-primary p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
                Saldo Total
              </p>
              <p className="text-2xl font-bold font-display text-primary-foreground mt-1">
                {formatCurrency(totals.balance)}
              </p>
            </div>
            <Wallet className="h-5 w-5 text-primary-foreground/70" />
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Receitas do mês
              </p>
              <p className="text-2xl font-bold font-display text-success mt-1">
                {formatCurrency(totals.income)}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Despesas do mês
              </p>
              <p className="text-2xl font-bold font-display text-destructive mt-1">
                {formatCurrency(totals.expenses)}
              </p>
            </div>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Receitas vs Despesas — últimos 6 meses
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} barGap={4}>
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
                formatter={(v: number) => formatCurrency(v)}
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

      {/* Category breakdown */}
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">
          Despesas por Categoria — últimos 6 meses
        </h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma despesa no período
          </p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {byCategory.map((cat) => (
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
    </div>
  );
}
