import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CreditCardAccount {
  id: string;
  name: string;
  institution?: string;
  type: "credit";
  balance: number;
  limit?: number;
  used?: number;
  closing_day?: number;
  due_day?: number;
}

const emptyForm = {
  name: "",
  institution: "",
  limit: "",
  used: "",
  closing_day: "",
  due_day: "",
};

function getStatusColor(usedPct: number) {
  if (usedPct >= 90) return "text-destructive";
  if (usedPct >= 70) return "text-yellow-400";
  return "text-success";
}

function getProgressColor(usedPct: number) {
  if (usedPct >= 90) return "bg-destructive";
  if (usedPct >= 70) return "bg-yellow-400";
  return "bg-success";
}

export default function Cartoes() {
  const [cards, setCards] = useState<CreditCardAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<CreditCardAccount | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCards = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("type", "credit")
      .order("created_at", { ascending: true });
    setCards(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openNew = () => {
    setEditCard(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (card: CreditCardAccount) => {
    setEditCard(card);
    setForm({
      name: card.name,
      institution: card.institution || "",
      limit: String(card.limit || ""),
      used: String(card.used || ""),
      closing_day: String(card.closing_day || ""),
      due_day: String(card.due_day || ""),
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    const lim = parseFloat(form.limit || "0");
    const used = parseFloat(form.used || "0");
    const payload = {
      name: form.name,
      institution: form.institution,
      type: "credit",
      balance: -used, // cartão de crédito: saldo negativo = dívida
      limit: lim,
      used: used,
      closing_day: parseInt(form.closing_day) || null,
      due_day: parseInt(form.due_day) || null,
    };
    let error;
    if (editCard) {
      ({ error } = await supabase
        .from("accounts")
        .update(payload)
        .eq("id", editCard.id));
    } else {
      ({ error } = await supabase.from("accounts").insert([payload]));
    }
    if (error) toast.error("Erro ao salvar cartão");
    else {
      toast.success(editCard ? "Cartão atualizado!" : "Cartão criado!");
      setDialogOpen(false);
      fetchCards();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", deleteId);
    if (error) toast.error("Erro ao excluir cartão");
    else {
      toast.success("Cartão excluído");
      fetchCards();
    }
    setDeleteId(null);
  };

  const totalLimit = cards.reduce((s, c) => s + (c.limit || 0), 0);
  const totalUsed = cards.reduce((s, c) => s + (c.used || 0), 0);
  const totalAvailable = totalLimit - totalUsed;

  // Calcular próximo vencimento
  const today = new Date();
  const nextDue = cards
    .filter((c) => c.due_day)
    .map((c) => {
      const d = new Date(today.getFullYear(), today.getMonth(), c.due_day!);
      if (d < today) d.setMonth(d.getMonth() + 1);
      return { card: c, date: d };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Cartões de Crédito
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle seus limites, faturas e vencimentos
          </p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Cartão
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Limite Total
          </p>
          <p className="text-2xl font-bold font-display text-foreground tabular-nums">
            {formatCurrency(totalLimit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {cards.length} cartão{cards.length !== 1 ? "ões" : ""}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Fatura Atual
          </p>
          <p className="text-2xl font-bold font-display text-destructive tabular-nums">
            {formatCurrency(totalUsed)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">em aberto</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Disponível
          </p>
          <p className="text-2xl font-bold font-display text-success tabular-nums">
            {formatCurrency(totalAvailable)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">para gastar</p>
        </div>
      </div>

      {/* Next due alert */}
      {nextDue && (
        <div className="flex items-center gap-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3">
          <Clock className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300">
            Próximo vencimento:{" "}
            <span className="font-semibold">{nextDue.card.name}</span> —{" "}
            {nextDue.date.toLocaleDateString("pt-BR")} (dia{" "}
            {nextDue.card.due_day})
          </p>
        </div>
      )}

      {/* Cards list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center border border-dashed border-border">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            Nenhum cartão cadastrado ainda.
          </p>
          <Button variant="link" className="mt-1" onClick={openNew}>
            Adicionar primeiro cartão
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const lim = card.limit || 0;
            const used = card.used || 0;
            const available = lim - used;
            const usedPct = lim > 0 ? Math.min((used / lim) * 100, 100) : 0;

            return (
              <div
                key={card.id}
                className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 space-y-4 relative overflow-hidden"
              >
                {/* Card decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="flex items-start justify-between relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <CreditCard className="h-5 w-5 text-white/80" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{card.name}</p>
                      <p className="text-xs text-white/50">
                        {card.institution || "Cartão de Crédito"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(card)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(card.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Usage bar */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Utilizado</span>
                    <span
                      className={cn("font-semibold", getStatusColor(usedPct))}
                    >
                      {usedPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getProgressColor(usedPct),
                      )}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-3 gap-2 relative text-center">
                  <div>
                    <p className="text-xs text-white/50">Fatura</p>
                    <p className="text-sm font-semibold text-destructive tabular-nums">
                      {formatCurrency(used)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Disponível</p>
                    <p className="text-sm font-semibold text-success tabular-nums">
                      {formatCurrency(available)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Limite</p>
                    <p className="text-sm font-semibold text-white/80 tabular-nums">
                      {formatCurrency(lim)}
                    </p>
                  </div>
                </div>

                {/* Days info */}
                {(card.closing_day || card.due_day) && (
                  <div className="flex gap-4 pt-1 border-t border-white/10 text-xs text-white/50 relative">
                    {card.closing_day && (
                      <span>Fecha dia {card.closing_day}</span>
                    )}
                    {card.due_day && <span>Vence dia {card.due_day}</span>}
                    {card.due_day &&
                      (() => {
                        const today = new Date();
                        const due = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          card.due_day!,
                        );
                        if (due < today) due.setMonth(due.getMonth() + 1);
                        const diff = Math.ceil(
                          (due.getTime() - today.getTime()) / 86400000,
                        );
                        return diff <= 5 ? (
                          <span className="ml-auto text-yellow-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {diff}d
                          </span>
                        ) : (
                          <span className="ml-auto text-white/30 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {diff}d
                          </span>
                        );
                      })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editCard ? "Editar Cartão" : "Novo Cartão de Crédito"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nome do Cartão *
                </Label>
                <Input
                  placeholder="Ex: Nubank, Inter..."
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Banco / Bandeira
                </Label>
                <Input
                  placeholder="Ex: Visa, Mastercard..."
                  value={form.institution}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, institution: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Limite (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5.000,00"
                  value={form.limit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, limit: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Fatura Atual (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.used}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, used: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Dia do Fechamento
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 15"
                  value={form.closing_day}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, closing_day: e.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Dia do Vencimento
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 20"
                  value={form.due_day}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, due_day: e.target.value }))
                  }
                  className="rounded-xl"
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
              <Button
                type="submit"
                className="flex-1 rounded-xl"
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : editCard
                    ? "Salvar"
                    : "Adicionar Cartão"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
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
