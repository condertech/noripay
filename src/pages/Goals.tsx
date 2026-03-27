// importações de mock removidas para uso do Supabase
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Goals = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Metas Financeiras
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe e conquiste seus objetivos
          </p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const pct = Math.round(
            (goal.currentAmount / goal.targetAmount) * 100,
          );
          const remaining = goal.targetAmount - goal.currentAmount;
          const deadline = new Date(
            goal.deadline + "T12:00:00",
          ).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Target className="h-5 w-5" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Prazo: {deadline}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: goal.color }}
                >
                  {pct}%
                </span>
              </div>

              <Progress value={pct} className="h-2.5 mb-3" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Guardado</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(goal.currentAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Faltam</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
