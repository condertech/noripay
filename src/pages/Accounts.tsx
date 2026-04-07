// importações de mock removidas para uso do Supabase
import {
  CreditCard,
  Building2,
  Wallet,
  PiggyBank,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  institution?: string;
  type: "checking" | "savings" | "wallet" | "credit";
  balance: number;
  limit?: number;
  used?: number;
  closing_day?: number;
  due_day?: number;
}

const typeIcons: Record<string, LucideIcon> = {
  checking: Building2,
  savings: PiggyBank,
  wallet: Wallet,
  credit: CreditCard,
};

const typeLabels: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupanca",
  wallet: "Carteira",
  credit: "Cartao de Credito",
};

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    institution: "",
    type: "checking",
    balance: "",
  });

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("accounts").select("*");
    if (!error) setAccounts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type) return;
    setSaving(true);
    const { error } = await supabase.from("accounts").insert([
      {
        name: form.name,
        institution: form.institution,
        type: form.type,
        balance: parseFloat(form.balance || "0"),
      },
    ]);
    if (error) toast.error("Erro ao criar conta");
    else {
      toast.success("Conta criada!");
      setDialogOpen(false);
      setForm({ name: "", institution: "", type: "checking", balance: "" });
      fetchAccounts();
    }
    setSaving(false);
  };

  const totalBalance = accounts
    .filter((a) => a.type !== "credit")
    .reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Contas e Cartoes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Patrimonio total: {formatCurrency(totalBalance)}
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Conta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Nome *
              </Label>
              <Input
                placeholder="Ex: Nubank, Caixa..."
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
                Instituição
              </Label>
              <Input
                placeholder="Ex: Banco do Brasil..."
                value={form.institution}
                onChange={(e) =>
                  setForm((f) => ({ ...f, institution: e.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tipo *
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="wallet">Carteira</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Saldo (R$)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.balance}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, balance: e.target.value }))
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
                disabled={saving}
                className="flex-1 rounded-xl"
              >
                {saving ? "Salvando..." : "Criar Conta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Carregando contas...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            Nenhuma conta cadastrada ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const Icon = typeIcons[acc.type];
            const isCredit = acc.type === "credit";
            const usedPct =
              isCredit && acc.limit
                ? Math.round(((acc.used || 0) / acc.limit) * 100)
                : 0;

            return (
              <div
                key={acc.id}
                className={cn(
                  "rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in",
                  isCredit
                    ? "bg-gradient-card text-primary-foreground"
                    : "bg-card",
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isCredit ? "bg-primary-foreground/20" : "bg-secondary",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isCredit
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isCredit
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {acc.name}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isCredit
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {acc.institution}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                      isCredit
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {typeLabels[acc.type]}
                  </span>
                </div>

                {isCredit ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-primary-foreground/70">
                        Fatura atual
                      </p>
                      <p className="text-2xl font-bold font-display">
                        {formatCurrency(acc.used || 0)}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-foreground transition-all"
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-primary-foreground/70">
                      <span>Usado: {usedPct}%</span>
                      <span>Limite: {formatCurrency(acc.limit || 0)}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-primary-foreground/70 pt-1">
                      <span>Fecha dia {acc.closing_day}</span>
                      <span>Vence dia {acc.due_day}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Saldo disponivel
                    </p>
                    <p className="text-2xl font-bold font-display text-foreground">
                      {formatCurrency(acc.balance)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Accounts;
