import { useEffect, useState } from "react";
import {
  Building2,
  Wallet,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Account {
  id: string;
  name: string;
  institution?: string;
  type: "checking" | "savings" | "wallet";
  balance: number;
}

interface Transaction {
  id: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category?: string;
  status: string;
}

const typeIcons: Record<string, LucideIcon> = {
  checking: Building2,
  savings: PiggyBank,
  wallet: Wallet,
};

const typeLabels: Record<string, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  wallet: "Carteira",
};

const typeColors: Record<string, string> = {
  checking: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  savings: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  wallet: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
};

const typeIconColors: Record<string, string> = {
  checking: "bg-blue-500/20 text-blue-400",
  savings: "bg-emerald-500/20 text-emerald-400",
  wallet: "bg-violet-500/20 text-violet-400",
};

const emptyForm = { name: "", institution: "", type: "checking", balance: "" };

export default function Contas() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountTx, setAccountTx] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .in("type", ["checking", "savings", "wallet"])
      .order("created_at", { ascending: true });
    setAccounts(data || []);
    setLoading(false);
  };

  const fetchAccountTx = async (accountName: string) => {
    setTxLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("account", accountName)
      .order("date", { ascending: false })
      .limit(10);
    setAccountTx(data || []);
    setTxLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) fetchAccountTx(selectedAccount.name);
  }, [selectedAccount]);

  const openNew = () => {
    setEditAccount(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (acc: Account) => {
    setEditAccount(acc);
    setForm({
      name: acc.name,
      institution: acc.institution || "",
      type: acc.type,
      balance: String(acc.balance),
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type) return;
    setSaving(true);
    const payload = {
      name: form.name,
      institution: form.institution,
      type: form.type,
      balance: parseFloat(form.balance || "0"),
    };
    let error;
    if (editAccount) {
      ({ error } = await supabase
        .from("accounts")
        .update(payload)
        .eq("id", editAccount.id));
    } else {
      ({ error } = await supabase.from("accounts").insert([payload]));
    }
    if (error) toast.error("Erro ao salvar conta");
    else {
      toast.success(editAccount ? "Conta atualizada!" : "Conta criada!");
      setDialogOpen(false);
      setEditAccount(null);
      fetchAccounts();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", deleteId);
    if (error) toast.error("Erro ao excluir conta");
    else {
      toast.success("Conta excluída");
      if (selectedAccount?.id === deleteId) setSelectedAccount(null);
      fetchAccounts();
    }
    setDeleteId(null);
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalSavings = accounts
    .filter((a) => a.type === "savings")
    .reduce((s, a) => s + (a.balance || 0), 0);
  const totalChecking = accounts
    .filter((a) => a.type === "checking")
    .reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Contas Bancárias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas contas correntes, poupanças e carteiras
          </p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Patrimônio Total
          </p>
          <p className="text-2xl font-bold font-display text-foreground tabular-nums">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accounts.length} conta{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Conta Corrente
          </p>
          <p className="text-2xl font-bold font-display text-blue-400 tabular-nums">
            {formatCurrency(totalChecking)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">disponível</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Poupança
          </p>
          <p className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
            {formatCurrency(totalSavings)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">reservas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Suas Contas
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-card animate-pulse"
                />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center border border-dashed border-border">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma conta cadastrada ainda.
              </p>
              <Button variant="link" className="mt-1 text-sm" onClick={openNew}>
                Adicionar primeira conta
              </Button>
            </div>
          ) : (
            accounts.map((acc) => {
              const Icon = typeIcons[acc.type] || Building2;
              return (
                <div
                  key={acc.id}
                  onClick={() =>
                    setSelectedAccount(
                      selectedAccount?.id === acc.id ? null : acc,
                    )
                  }
                  className={cn(
                    "rounded-2xl bg-gradient-to-br border p-5 cursor-pointer transition-all hover:scale-[1.01]",
                    typeColors[acc.type],
                    selectedAccount?.id === acc.id ? "ring-2 ring-primary" : "",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          typeIconColors[acc.type],
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {acc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {acc.institution || typeLabels[acc.type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold font-display tabular-nums text-foreground">
                          {formatCurrency(acc.balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[acc.type]}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(acc);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(acc.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Account transactions panel */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {selectedAccount
              ? `Últimas Transações — ${selectedAccount.name}`
              : "Selecione uma conta"}
          </h2>
          {!selectedAccount ? (
            <div className="rounded-2xl bg-card p-8 text-center border border-dashed border-border h-48 flex flex-col items-center justify-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique em uma conta para ver o extrato
              </p>
            </div>
          ) : txLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-card animate-pulse"
                />
              ))}
            </div>
          ) : accountTx.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Nenhuma transação nesta conta ainda.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card shadow-card overflow-hidden">
              <div className="divide-y divide-border">
                {accountTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          tx.type === "income"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {tx.type === "income" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString("pt-BR")}
                          {tx.category ? ` · ${tx.category}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        tx.type === "income"
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
              {accountTx.length === 10 && (
                <div className="px-4 py-3 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    Mostrando últimas 10 transações
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Balance breakdown */}
          {selectedAccount && (
            <div className="rounded-2xl bg-card p-5 shadow-card space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resumo — {selectedAccount.name}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Total Entradas</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-success">
                  {formatCurrency(
                    accountTx
                      .filter((t) => t.type === "income")
                      .reduce((s, t) => s + t.amount, 0),
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Total Saídas</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-destructive">
                  {formatCurrency(
                    accountTx
                      .filter((t) => t.type === "expense")
                      .reduce((s, t) => s + t.amount, 0),
                  )}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Saldo Atual</span>
                <span className="text-lg font-bold font-display text-foreground tabular-nums">
                  {formatCurrency(selectedAccount.balance)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editAccount ? "Editar Conta" : "Nova Conta"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preencha os dados da conta bancária
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Nome da Conta *
              </Label>
              <Input
                placeholder="Ex: Nubank, Caixa Econômica..."
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
                placeholder="Ex: Banco do Brasil, Itaú..."
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Saldo Atual (R$)
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
                className="flex-1 rounded-xl"
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : editAccount
                    ? "Salvar"
                    : "Criar Conta"}
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
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta será removida
              permanentemente.
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
