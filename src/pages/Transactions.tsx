import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

type FilterType = "all" | "income" | "expense";

import { supabase } from "@/lib/supabase";

const Transactions = () => {
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (!error) setTxList(data || []);
    setLoading(false);
  };

  const handleSave = async (tx: Transaction) => {
    if (tx.id && txList.find((t) => t.id === tx.id)) {
      // update
      const { error } = await supabase
        .from("transactions")
        .update({ ...tx })
        .eq("id", tx.id);
      if (!error) toast.success("Transacao atualizada com sucesso");
    } else {
      // insert
      const { error } = await supabase.from("transactions").insert([{ ...tx }]);
      if (!error) toast.success("Transacao adicionada com sucesso");
    }
    setEditTx(null);
    fetchTransactions();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", deleteId);
    if (!error) toast.success("Transacao removida");
    setDeleteId(null);
    fetchTransactions();
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setFormOpen(true);
  };

  const filtered = txList.filter((tx) => {
    const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || tx.type === filter;
    return matchSearch && matchType;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todas", value: "all" },
    { label: "Receitas", value: "income" },
    { label: "Despesas", value: "expense" },
  ];

  const handleNewTransaction = () => {
    setEditTx(null);
    setFormOpen(true);
  };

  const totalIncome = txList
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = txList
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Transacoes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todas as suas movimentacoes
          </p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={handleNewTransaction}>
          <Plus className="h-4 w-4" />
          Nova Transacao
        </Button>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Total transacoes</p>
          <p className="text-lg font-bold font-display text-foreground tabular-nums">
            {txList.length}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Receitas</p>
          <p className="text-lg font-bold font-display text-success tabular-nums">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Despesas</p>
          <p className="text-lg font-bold font-display text-destructive tabular-nums">
            {formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transacao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-border"
          />
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {filters.map((f) => (
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
      </div>

      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    tx.type === "income"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tx.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {tx.category} · {tx.account}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                        tx.status === "paid"
                          ? "bg-success/10 text-success"
                          : tx.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {tx.status === "paid"
                        ? "Pago"
                        : tx.status === "pending"
                          ? "Pendente"
                          : "Atrasado"}
                    </span>
                    {tx.recurrent && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                        Recorrente
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      tx.type === "income" ? "text-success" : "text-foreground",
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.date)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem
                      onClick={() => handleEdit(tx)}
                      className="gap-2 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteId(tx.id)}
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">Nenhuma transacao encontrada</p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl gap-2"
                onClick={handleNewTransaction}
              >
                <Plus className="h-4 w-4" />
                Adicionar transacao
              </Button>
            </div>
          )}
        </div>
      </div>

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        editTransaction={editTx}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transacao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transacao? Essa acao nao pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
