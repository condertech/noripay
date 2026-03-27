import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// importações de mock removidas para uso do Supabase
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const categories = [
  { value: "Salario", label: "Salario" },
  { value: "Freelance", label: "Freelance" },
  { value: "Alimentacao", label: "Alimentacao" },
  { value: "Moradia", label: "Moradia" },
  { value: "Transporte", label: "Transporte" },
  { value: "Saude", label: "Saude" },
  { value: "Lazer", label: "Lazer" },
  { value: "Estudos", label: "Estudos" },
  { value: "Assinaturas", label: "Assinaturas" },
  { value: "Investimento", label: "Investimento" },
  { value: "Outros", label: "Outros" },
];

const statusOptions = [
  { value: "paid", label: "Pago" },
  { value: "pending", label: "Pendente" },
  { value: "overdue", label: "Atrasado" },
];

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tx: Transaction) => void;
  editTransaction?: Transaction | null;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  onSave,
  editTransaction,
}: TransactionFormDialogProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"paid" | "pending" | "overdue">(
    "pending",
  );
  const [recurrent, setRecurrent] = useState(false);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setTitle(editTransaction.title);
      setDescription(editTransaction.description);
      setAmount(String(editTransaction.amount));
      setCategory(editTransaction.category);
      setAccount(editTransaction.account);
      setDate(editTransaction.date);
      setStatus(editTransaction.status);
      setRecurrent(editTransaction.recurrent);
    } else {
      resetForm();
    }
  }, [editTransaction, open]);

  const resetForm = () => {
    setType("expense");
    setTitle("");
    setDescription("");
    setAmount("");
    setCategory("");
    setAccount("");
    setDate(new Date().toISOString().split("T")[0]);
    setStatus("pending");
    setRecurrent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !category || !account) return;

    const tx: Transaction = {
      id: editTransaction?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      categoryIcon: "Tag",
      account,
      date,
      status,
      recurrent,
    };

    onSave(tx);
    onOpenChange(false);
    resetForm();
  };

  const isValid =
    title.trim() && amount && parseFloat(amount) > 0 && category && account;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-display text-lg font-semibold text-foreground">
            {editTransaction ? "Editar Transacao" : "Nova Transacao"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all border",
                type === "expense"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-secondary border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all border",
                type === "income"
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-secondary border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Receita
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Titulo *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Supermercado, Salario..."
              className="rounded-xl border-border"
              maxLength={100}
            />
          </div>

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Valor (R$) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="rounded-xl border-border tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border-border"
              />
            </div>
          </div>

          {/* Category + Account row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Categoria *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Conta *
              </Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="rounded-xl border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </Label>
            <div className="flex gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    setStatus(s.value as "paid" | "pending" | "overdue")
                  }
                  className={cn(
                    "flex-1 rounded-xl py-2 text-xs font-medium transition-all border",
                    status === s.value
                      ? s.value === "paid"
                        ? "bg-success/10 border-success/30 text-success"
                        : s.value === "pending"
                          ? "bg-warning/10 border-warning/30 text-warning"
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      : "bg-secondary border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Descricao
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre a transacao..."
              className="rounded-xl border-border resize-none min-h-[70px]"
              maxLength={500}
            />
          </div>

          {/* Recurrent toggle */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Recorrente</p>
              <p className="text-xs text-muted-foreground">
                Repete todo mes automaticamente
              </p>
            </div>
            <Switch checked={recurrent} onCheckedChange={setRecurrent} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className={cn(
                "flex-1 rounded-xl font-medium",
                type === "income"
                  ? "bg-success hover:bg-success/90 text-white"
                  : "",
              )}
            >
              {editTransaction ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
