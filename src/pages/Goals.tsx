import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Goal = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  color: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGoals = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("deadline", { ascending: true });

    if (error) {
      setError("Erro ao carregar metas");
      console.error(error);
    } else {
      setGoals(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Metas Financeiras
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe e conquiste seus objetivos
          </p>
        </div>

        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {loading && (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Carregando metas...</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && goals.length === 0 && (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            Nenhuma meta cadastrada ainda.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const pct = Math.min(
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
            100,
          );

          const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

          const deadline = new Date(
            goal.deadline + "T12:00:00",
          ).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={goal.id}
              className="animate-fade-in rounded-2xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="mb-4 flex items-start justify-between">
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

              <Progress value={pct} className="mb-3 h-2.5" />

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
