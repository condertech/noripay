import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Debt {
  id: string;
  name: string;
  creditor?: string;
  total_amount: number;
  paid_amount: number;
  due_date?: string;
  status: "active" | "paid" | "overdue";
  installments?: number;
  notes?: string;
}

const emptyForm = {
  name: "",
  creditor: "",
  total_amount: "",
  paid_amount: "",
  due_date: "",
  installments: "",
  notes: "",
  status: "active",
};

const statusConfig = {
  active: { label: "Em aberto", color: "text-blue-400", bg: "bg-blue-400/10" },
  paid: { label: "Quitado", color: "text-success", bg: "bg-success/10" },
  overdue: { label: "Atrasado", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Dividas() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "paid">("all");
  const [form, setForm] = useState(emptyForm);

  const fetchDebts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("debts")
      .select("*")
      .order("due_date", { ascending: true });
    setDebts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const openNew = () => {
    setEditDebt(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Debt) => {
    setEditDebt(d);
    setForm({
      name: d.name,
      creditor: d.creditor || "",
      total_amount: String(d.total_amount),
      paid_amount: String(d.paid_amount),
      due_date: d.due_date || "",
      installments: String(d.installments || ""),
      notes: d.notes || "",
      status: d.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.total_amount) return;
    setSaving(true);
    const total = parseFloat(form.total_amount);
    const paid = parseFloat(form.paid_amount || "0");
    const payload = {
      name: form.name,
      creditor: form.creditor || null,
      total_amount: total,
      paid_amount: paid,
      due_date: form.due_date || null,
      installments: parseInt(form.installments) || null,
      notes: form.notes || null,
      status: paid >= total ? "paid" : form.status,
    };
    let error;
    if (editDebt) {
      ({ error } = await supabase.from("debts").update(payload).eq("id", editDebt.id));
    } else {
      ({ error } = await supabase.from("debts").insert([payload]));
    }
    if (error) toast.error("Erro ao salvar dívida");
    else {
      toast.success(editDebt ? "Dívida atualizada!" : "Dívida registrada!");
      setDialogOpen(false);
      fetchDebts();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("debts").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Dívida removida"); fetchDebts(); }
    setDeleteId(null);
  };

  const handleMarkPaid = async (debt: Debt) => {
    const { error } = await supabase
      .from("debts")
      .update({ paid_amount: debt.total_amount, status: "paid" })
      .eq("id", debt.id);
    if (!error) { toast.success("Dívida marcada como quitada!"); fetchDebts(); }
  };

  const filtered = filter === "all" ? debts : debts.filter((d) => d.status === filter);

  const totalDebt = debts.filter((d) => d.status !== "paid").reduce((s, d) => s + d.total_amount, 0);
  const totalPaid = debts.reduce((s, d) => s + d.paid_amount, 0);
  const totalRemaining = debts.filter((d) => d.status !== "paid").reduce((s, d) => s + (d.total_amount - d.paid_amount), 0);
  const overdue = debts.filter((d) => d.status === "overdue").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Agenda de Dívidas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle o que você deve e acompanhe o pagamento
          </p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova Dívida
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total em Dívidas</p>
          <p className="text-xl font-bold font-display text-destructive tabular-nums">
            {formatCurrency(totalDebt)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Já Pago</p>
          <p className="text-xl font-bold font-display text-success tabular-nums">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Restante</p>
          <p className="text-xl font-bold font-display text-yellow-400 tabular-nums">
            {formatCurrency(totalRemaining)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Atrasadas</p>
          <p className={cn("text-xl font-bold font-display tabular-nums", overdue > 0 ? "text-destructive" : "text-muted-foreground")}>
            {overdue}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {([
          { value: "all", label: "Todas" },
          { value: "active", label: "Em Aberto" },
          { value: "overdue", label: "Atrasadas" },
          { value: "paid", label: "Quitadas" },
        ] as const).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              filter === f.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Debts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center border border-dashed border-border">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Nenhuma dívida registrada.</p>
          <Button variant="link" onClick={openNew}>Registrar primeira dívida</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((debt) => {
            const pct = debt.total_amount > 0
              ? Math.min((debt.paid_amount / debt.total_amount) * 100, 100)
              : 0;
            const remaining = debt.total_amount - debt.paid_amount;
            const st = statusConfig[debt.status];
            return (
              <div key={debt.id} className="rounded-2xl bg-card shadow-card border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{debt.name}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", st.bg, st.color)}>
                        {st.label}
                      </span>
                    </div>
                    {debt.creditor && (
                      <p className="text-xs text-muted-foreground mt-0.5">Para: {debt.creditor}</p>
                    )}
                    {debt.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Vence: {new Date(debt.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        {debt.installments ? ` · ${debt.installments}x` : ""}
                      </p>
                    )}
                    {debt.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">{debt.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold font-display tabular-nums text-destructive">
                      {formatCurrency(remaining)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      de {formatCurrency(debt.total_amount)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {debt.status !== "paid" && (
                        <DropdownMenuItem onClick={() => handleMarkPaid(debt)}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                          Marcar como quitada
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openEdit(debt)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(debt.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct >= 100 ? "bg-success" : pct >= 50 ? "bg-yellow-400" : "bg-destructive",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pago: {formatCurrency(debt.paid_amount)}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editDebt ? "Editar Dívida" : "Registrar Nova Dívida"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preencha os dados da dívida
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nome da Dívida *
                </Label>
                <Input
                  placeholder="Ex: Empréstimo pessoal, Financiamento..."
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Credor (para quem deve)
                </Label>
                <Input
                  placeholder="Ex: Banco, amigo João..."
                  value={form.creditor}
                  onChange={(e) => setForm((f) => ({ ...f, creditor: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Valor Total (R$) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.total_amount}
                  onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Valor Já Pago (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.paid_amount}
                  onChange={(e) => setForm((f) => ({ ...f, paid_amount: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Data de Vencimento
                </Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Parcelas
                </Label>
                <Input
                  type="number"
                  placeholder="Ex: 12 (se parcelado)"
                  value={form.installments}
                  onChange={(e) => setForm((f) => ({ ...f, installments: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Em Aberto</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                    <SelectItem value="paid">Quitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Observações
                </Label>
                <Textarea
                  placeholder="Detalhes, juros, acordo..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="rounded-xl resize-none"
                  rows={2}
                />
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
              <Button type="submit" className="flex-1 rounded-xl" disabled={saving}>
                {saving ? "Salvando..." : editDebt ? "Salvar" : "Registrar Dívida"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
