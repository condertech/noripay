// importações de mock removidas para uso do Supabase
import { Progress } from "@/components/ui/progress";

export function GoalsPreview() {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-foreground">Metas</h3>
        <a
          href="/metas"
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver todas
        </a>
      </div>
      <div className="space-y-4">
        {goals.slice(0, 3).map((goal) => {
          const pct = Math.round(
            (goal.currentAmount / goal.targetAmount) * 100,
          );
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {goal.name}
                </p>
                <span className="text-xs font-semibold text-primary">
                  {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(goal.currentAmount)}</span>
                <span>{formatCurrency(goal.targetAmount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
