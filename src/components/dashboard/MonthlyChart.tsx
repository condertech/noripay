import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
// importações de mock removidas para uso do Supabase

export function MonthlyChart() {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Receitas vs Despesas
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} barGap={4}>
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
// Fallback seguro para monthlyData
const monthlyData = {
  labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
  datasets: [
    {
      label: "Saldo",
      data: [0, 0, 0, 0, 0, 0],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.1)",
      tension: 0.4,
    },
  ],
};
