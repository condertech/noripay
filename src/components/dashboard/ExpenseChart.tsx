import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
// importações de mock removidas para uso do Supabase

// Fallback seguro para categoryExpenses
const categoryExpenses = [
  { name: "Alimentação", value: 0, color: "#f87171" },
  { name: "Transporte", value: 0, color: "#60a5fa" },
  { name: "Lazer", value: 0, color: "#fbbf24" },
  { name: "Outros", value: 0, color: "#a3e635" },
];

export function ExpenseChart() {
  const total = categoryExpenses.reduce((s, c) => s + c.value, 0);

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <h3 className="font-display font-semibold text-foreground mb-4">
        Despesas por Categoria
      </h3>
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
    </div>
  );
}
