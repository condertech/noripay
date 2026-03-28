import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

type Goal = {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number;
};

export function GoalsPreview() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, name, current_amount, target_amount")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error) setGoals(data || []);
    };
    fetchGoals();
  }, []);

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
        {goals.map((goal) => {
          const pct = Math.round(
            (goal.current_amount / goal.target_amount) * 100,
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
                <span>{formatCurrency(goal.current_amount)}</span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
