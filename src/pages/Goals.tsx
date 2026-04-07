import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Goal = {
  id: string;
  name: string;
  current_amount: number;
  target_amount: number;
  deadline: string;
  color: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const COLORS = [
  "#818cf8",
  "#34d399",
  "#f87171",
  "#60a5fa",
  "#fbbf24",
  "#f472b6",
  "#fb923c",
  "#a3e635",
];

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
    color: COLORS[0],
  });

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
    } else setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.target_amount || !form.deadline) return;
    setSaving(true);
    const { error } = await supabase.from("goals").insert([
      {
        name: form.name,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount || "0"),
        deadline: form.deadline,
        color: form.color,
      },
    ]);
    if (error) toast.error("Erro ao criar meta");
    else {
      toast.success("Meta criada!");
      setDialogOpen(false);
      setForm({
        name: "",
        target_amount: "",
        current_amount: "",
        deadline: "",
        color: COLORS[0],
      });
      fetchGoals();
    }
    setSaving(false);
  };

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

        <Button
          className="gap-2 rounded-xl"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Nome *
              </Label>
              <Input
                placeholder="Ex: Viagem, Reserva de emergência..."
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Valor alvo (R$) *
                </Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={form.target_amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, target_amount: e.target.value }))
                  }
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Já guardado (R$)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.current_amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, current_amount: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Prazo *
              </Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Cor
              </Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`h-7 w-7 rounded-full transition-transform ${form.color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl"
              >
                {saving ? "Salvando..." : "Criar Meta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
            Math.round((goal.current_amount / goal.target_amount) * 100),
            100,
          );

          const remaining = Math.max(
            goal.target_amount - goal.current_amount,
            0,
          );

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
                      Prazo:{" "}
                      {new Date(goal.deadline + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                        { month: "long", year: "numeric" },
                      )}
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
                    {formatCurrency(goal.current_amount)}
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
