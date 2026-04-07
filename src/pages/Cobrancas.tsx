import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  RefreshCw,
  Repeat,
  Clock,
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  status: "paid" | "pending" | "overdue";
  recurrent: boolean;
}

interface Receivable {
  id: string;
  name: string;
  debtor?: string;
  amount: number;
  due_date: string;
  status: "received" | "pending" | "overdue";
  notes?: string;
}

interface RecurringEntry {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  day_of_month?: number;
  active: boolean;
}

type Tab = "pagar" | "receber" | "fixas";

// ─── Status configs ───────────────────────────────────────────────────────────
const billStatus = {
  paid: { label: "Pago", color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pendente", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  overdue: { label: "Atrasado", color: "text-destructive", bg: "bg-destructive/10" },
};

const recStatus = {
  received: { label: "Recebido", color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pendente", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  overdue: { label: "Atrasado", color: "text-destructive", bg: "bg-destructive/10" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Cobrancas() {
  const [tab, setTab] = useState<Tab>("pagar");

  // ── A Pagar ──
  const [bills, setBills] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billDialog, setBillDialog] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [billForm, setBillForm] = useState({ name: "", amount: "", due_date: "", status: "pending", recurrent: false });

  // ── A Receber ──
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recDialog, setRecDialog] = useState(false);
  const [editRec, setEditRec] = useState<Receivable | null>(null);
  const [deleteRecId, setDeleteRecId] = useState<string | null>(null);
  const [recForm, setRecForm] = useState({ name: "", debtor: "", amount: "", due_date: "", status: "pending", notes: "" });

  // ── Fixas ──
  const [entries, setEntries] = useState<RecurringEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entryDialog, setEntryDialog] = useState(false);
  const [editEntry, setEditEntry] = useState<RecurringEntry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState({ name: "", amount: "", type: "income", day_of_month: "", active: true });

  const [saving, setSaving] = useState(false);

  // ── Fetch ──
  const fetchBills = async () => {
    setBillsLoading(true);
    const { data } = await supabase.from("bills").select("*").order("due_date", { ascending: true });
    setBills(data || []);
    setBillsLoading(false);
  };

  const fetchReceivables = async () => {
    setRecLoading(true);
    const { data } = await supabase.from("receivables").select("*").order("due_date", { ascending: true });
    setReceivables(data || []);
    setRecLoading(false);
  };

  const fetchEntries = async () => {
    setEntriesLoading(true);
    const { data } = await supabase.from("recurring_entries").select("*").order("type").order("name");
    setEntries(data || []);
    setEntriesLoading(false);
  };

  useEffect(() => {
    fetchBills();
    fetchReceivables();
    fetchEntries();
  }, []);

  // ── Bills CRUD ──
  const openNewBill = () => {
    setEditBill(null);
    setBillForm({ name: "", amount: "", due_date: "", status: "pending", recurrent: false });
    setBillDialog(true);
  };

  const openEditBill = (b: Bill) => {
    setEditBill(b);
    setBillForm({ name: b.name, amount: String(b.amount), due_date: b.due_date, status: b.status, recurrent: b.recurrent });
    setBillDialog(true);
  };

  const saveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.name || !billForm.amount || !billForm.due_date) return;
    setSaving(true);
    const payload = { name: billForm.name, amount: parseFloat(billForm.amount), due_date: billForm.due_date, status: billForm.status, recurrent: billForm.recurrent };
    const { error } = editBill
      ? await supabase.from("bills").update(payload).eq("id", editBill.id)
      : await supabase.from("bills").insert([payload]);
    if (error) toast.error("Erro ao salvar");
    else { toast.success(editBill ? "Atualizado!" : "Cobrança criada!"); setBillDialog(false); fetchBills(); }
    setSaving(false);
  };

  const markBillPaid = async (id: string) => {
    await supabase.from("bills").update({ status: "paid" }).eq("id", id);
    toast.success("Marcado como pago!"); fetchBills();
  };

  // ── Receivables CRUD ──
  const openNewRec = () => {
    setEditRec(null);
    setRecForm({ name: "", debtor: "", amount: "", due_date: "", status: "pending", notes: "" });
    setRecDialog(true);
  };

  const openEditRec = (r: Receivable) => {
    setEditRec(r);
    setRecForm({ name: r.name, debtor: r.debtor || "", amount: String(r.amount), due_date: r.due_date, status: r.status, notes: r.notes || "" });
    setRecDialog(true);
  };

  const saveRec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recForm.name || !recForm.amount || !recForm.due_date) return;
    setSaving(true);
    const payload = { name: recForm.name, debtor: recForm.debtor || null, amount: parseFloat(recForm.amount), due_date: recForm.due_date, status: recForm.status, notes: recForm.notes || null };
    const { error } = editRec
      ? await supabase.from("receivables").update(payload).eq("id", editRec.id)
      : await supabase.from("receivables").insert([payload]);
    if (error) toast.error("Erro ao salvar");
    else { toast.success(editRec ? "Atualizado!" : "Cobrança criada!"); setRecDialog(false); fetchReceivables(); }
    setSaving(false);
  };

  const markRecReceived = async (id: string) => {
    await supabase.from("receivables").update({ status: "received" }).eq("id", id);
    toast.success("Marcado como recebido!"); fetchReceivables();
  };

  // ── Recurring CRUD ──
  const openNewEntry = () => {
    setEditEntry(null);
    setEntryForm({ name: "", amount: "", type: "income", day_of_month: "", active: true });
    setEntryDialog(true);
  };

  const openEditEntry = (r: RecurringEntry) => {
    setEditEntry(r);
    setEntryForm({ name: r.name, amount: String(r.amount), type: r.type, day_of_month: String(r.day_of_month || ""), active: r.active });
    setEntryDialog(true);
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.name || !entryForm.amount) return;
    setSaving(true);
    const payload = { name: entryForm.name, amount: parseFloat(entryForm.amount), type: entryForm.type, day_of_month: parseInt(entryForm.day_of_month) || null, active: entryForm.active };
    const { error } = editEntry
      ? await supabase.from("recurring_entries").update(payload).eq("id", editEntry.id)
      : await supabase.from("recurring_entries").insert([payload]);
    if (error) toast.error("Erro ao salvar");
    else { toast.success(editEntry ? "Atualizado!" : "Entrada fixa criada!"); setEntryDialog(false); fetchEntries(); }
    setSaving(false);
  };

  const toggleEntryActive = async (r: RecurringEntry) => {
    await supabase.from("recurring_entries").update({ active: !r.active }).eq("id", r.id);
    fetchEntries();
  };

  // ── Derived ──
  const billsPending = bills.filter((b) => b.status !== "paid").reduce((s, b) => s + b.amount, 0);
  const recPending = receivables.filter((r) => r.status !== "received").reduce((s, r) => s + r.amount, 0);
  const fixedIncome = entries.filter((e) => e.type === "income" && e.active).reduce((s, e) => s + e.amount, 0);
  const fixedExpense = entries.filter((e) => e.type === "expense" && e.active).reduce((s, e) => s + e.amount, 0);
  const netFixed = fixedIncome - fixedExpense;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Cobranças
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie contas a pagar, a receber e entradas fixas mensais
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl"
          onClick={() => tab === "pagar" ? openNewBill() : tab === "receber" ? openNewRec() : openNewEntry()}
        >
          <Plus className="h-4 w-4" />
          {tab === "pagar" ? "Nova Conta" : tab === "receber" ? "Nova Cobrança" : "Nova Entrada Fixa"}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">A Pagar</p>
          <p className="text-xl font-bold font-display text-destructive tabular-nums">{formatCurrency(billsPending)}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">A Receber</p>
          <p className="text-xl font-bold font-display text-success tabular-nums">{formatCurrency(recPending)}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Renda Fixa/mês</p>
          <p className="text-xl font-bold font-display text-success tabular-nums">{formatCurrency(fixedIncome)}</p>
        </div>
        <div className={cn("rounded-2xl bg-card p-4 shadow-card border border-border")}>
          <p className="text-xs text-muted-foreground mb-1">Saldo Fixo/mês</p>
          <p className={cn("text-xl font-bold font-display tabular-nums", netFixed >= 0 ? "text-success" : "text-destructive")}>
            {formatCurrency(netFixed)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-fit">
        {([
          { value: "pagar", label: "A Pagar" },
          { value: "receber", label: "A Receber" },
          { value: "fixas", label: "Entradas Fixas" },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === t.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: A PAGAR ── */}
      {tab === "pagar" && (
        <div>
          {billsLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-card animate-pulse" />)}</div>
          ) : bills.length === 0 ? (
            <EmptyState icon={<Clock />} label="Nenhuma conta a pagar" onAdd={openNewBill} />
          ) : (
            <div className="rounded-2xl bg-card shadow-card overflow-hidden">
              <div className="divide-y divide-border">
                {bills.map((b) => {
                  const st = billStatus[b.status];
                  return (
                    <div key={b.id} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive")}>
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{b.name}</p>
                            {b.recurrent && <RefreshCw className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded-md font-medium", st.bg, st.color)}>{st.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(b.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-destructive tabular-nums">{formatCurrency(b.amount)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {b.status !== "paid" && (
                              <DropdownMenuItem onClick={() => markBillPaid(b.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />Marcar como pago
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEditBill(b)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteBillId(b.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: A RECEBER ── */}
      {tab === "receber" && (
        <div>
          {recLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-card animate-pulse" />)}</div>
          ) : receivables.length === 0 ? (
            <EmptyState icon={<ArrowDownLeft />} label="Nenhuma cobrança a receber" onAdd={openNewRec} />
          ) : (
            <div className="rounded-2xl bg-card shadow-card overflow-hidden">
              <div className="divide-y divide-border">
                {receivables.map((r) => {
                  const st = recStatus[r.status];
                  return (
                    <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                          <ArrowDownLeft className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{r.name}</p>
                            {r.debtor && <span className="text-xs text-muted-foreground">de {r.debtor}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded-md font-medium", st.bg, st.color)}>{st.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(r.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          {r.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{r.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-success tabular-nums">{formatCurrency(r.amount)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {r.status !== "received" && (
                              <DropdownMenuItem onClick={() => markRecReceived(r.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />Marcar como recebido
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEditRec(r)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteRecId(r.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: FIXAS ── */}
      {tab === "fixas" && (
        <div className="space-y-4">
          {/* Balance panel */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Balanço Mensal Fixo</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-lg font-bold text-success tabular-nums">{formatCurrency(fixedIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saídas</p>
                <p className="text-lg font-bold text-destructive tabular-nums">{formatCurrency(fixedExpense)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className={cn("text-lg font-bold tabular-nums", netFixed >= 0 ? "text-success" : "text-destructive")}>{formatCurrency(netFixed)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              💡 Este saldo representa quanto sobra por mês após suas entradas e saídas fixas.
            </p>
          </div>

          {entriesLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-card animate-pulse" />)}</div>
          ) : entries.length === 0 ? (
            <EmptyState icon={<Repeat />} label="Nenhuma entrada fixa. Adicione seu salário, VA, aluguel..." onAdd={openNewEntry} />
          ) : (
            <div className="rounded-2xl bg-card shadow-card overflow-hidden">
              {/* Income */}
              {entries.filter((e) => e.type === "income").length > 0 && (
                <div>
                  <div className="px-5 py-2 bg-success/5 border-b border-border">
                    <p className="text-xs font-semibold text-success uppercase tracking-wider">Entradas Fixas</p>
                  </div>
                  <div className="divide-y divide-border">
                    {entries.filter((e) => e.type === "income").map((r) => (
                      <RecurringRow key={r.id} entry={r} onEdit={openEditEntry} onDelete={() => setDeleteEntryId(r.id)} onToggle={() => toggleEntryActive(r)} />
                    ))}
                  </div>
                </div>
              )}
              {/* Expense */}
              {entries.filter((e) => e.type === "expense").length > 0 && (
                <div>
                  <div className="px-5 py-2 bg-destructive/5 border-y border-border">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider">Saídas Fixas</p>
                  </div>
                  <div className="divide-y divide-border">
                    {entries.filter((e) => e.type === "expense").map((r) => (
                      <RecurringRow key={r.id} entry={r} onEdit={openEditEntry} onDelete={() => setDeleteEntryId(r.id)} onToggle={() => toggleEntryActive(r)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── DIALOGS ── */}

      {/* Bill Dialog */}
      <Dialog open={billDialog} onOpenChange={setBillDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editBill ? "Editar Conta" : "Nova Conta a Pagar"}</DialogTitle>
            <DialogDescription className="sr-only">Preencha os dados da conta a pagar</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveBill} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição *</Label>
              <Input placeholder="Ex: Aluguel, Internet, Luz..." value={billForm.name} onChange={(e) => setBillForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valor (R$) *</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={billForm.amount} onChange={(e) => setBillForm((f) => ({ ...f, amount: e.target.value }))} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Vencimento *</Label>
                <Input type="date" value={billForm.due_date} onChange={(e) => setBillForm((f) => ({ ...f, due_date: e.target.value }))} className="rounded-xl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select value={billForm.status} onValueChange={(v) => setBillForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Recorrente?</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={billForm.recurrent} onCheckedChange={(v) => setBillForm((f) => ({ ...f, recurrent: v }))} />
                  <span className="text-sm text-muted-foreground">{billForm.recurrent ? "Sim" : "Não"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setBillDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={saving}>{saving ? "Salvando..." : editBill ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receivable Dialog */}
      <Dialog open={recDialog} onOpenChange={setRecDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editRec ? "Editar Cobrança" : "Nova Cobrança a Receber"}</DialogTitle>
            <DialogDescription className="sr-only">Preencha os dados da cobrança a receber</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveRec} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descrição *</Label>
              <Input placeholder="Ex: Salário, Serviço prestado..." value={recForm.name} onChange={(e) => setRecForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Devedor (quem paga)</Label>
                <Input placeholder="Nome da empresa ou pessoa" value={recForm.debtor} onChange={(e) => setRecForm((f) => ({ ...f, debtor: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valor (R$) *</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={recForm.amount} onChange={(e) => setRecForm((f) => ({ ...f, amount: e.target.value }))} className="rounded-xl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Data Prevista *</Label>
                <Input type="date" value={recForm.due_date} onChange={(e) => setRecForm((f) => ({ ...f, due_date: e.target.value }))} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select value={recForm.status} onValueChange={(v) => setRecForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Observações</Label>
              <Input placeholder="Detalhes, referência..." value={recForm.notes} onChange={(e) => setRecForm((f) => ({ ...f, notes: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setRecDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={saving}>{saving ? "Salvando..." : editRec ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recurring Entry Dialog */}
      <Dialog open={entryDialog} onOpenChange={setEntryDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editEntry ? "Editar Entrada Fixa" : "Nova Entrada Fixa"}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Cadastre receitas ou despesas que se repetem todo mês (salário, VA, aluguel, etc.)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEntry} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nome *</Label>
              <Input placeholder="Ex: Salário, Vale Alimentação, Aluguel..." value={entryForm.name} onChange={(e) => setEntryForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo</Label>
                <Select value={entryForm.type} onValueChange={(v) => setEntryForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entrada (Receita)</SelectItem>
                    <SelectItem value="expense">Saída (Despesa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valor (R$) *</Label>
                <Input type="number" step="0.01" placeholder="0,00" value={entryForm.amount} onChange={(e) => setEntryForm((f) => ({ ...f, amount: e.target.value }))} className="rounded-xl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Dia do Mês</Label>
                <Input type="number" min="1" max="31" placeholder="Ex: 5 (dia 5 de cada mês)" value={entryForm.day_of_month} onChange={(e) => setEntryForm((f) => ({ ...f, day_of_month: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ativa?</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={entryForm.active} onCheckedChange={(v) => setEntryForm((f) => ({ ...f, active: v }))} />
                  <span className="text-sm text-muted-foreground">{entryForm.active ? "Sim" : "Não"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setEntryDialog(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={saving}>{saving ? "Salvando..." : editEntry ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirms */}
      {[
        { id: deleteBillId, set: setDeleteBillId, label: "conta a pagar", fn: async () => { await supabase.from("bills").delete().eq("id", deleteBillId!); fetchBills(); } },
        { id: deleteRecId, set: setDeleteRecId, label: "cobrança", fn: async () => { await supabase.from("receivables").delete().eq("id", deleteRecId!); fetchReceivables(); } },
        { id: deleteEntryId, set: setDeleteEntryId, label: "entrada fixa", fn: async () => { await supabase.from("recurring_entries").delete().eq("id", deleteEntryId!); fetchEntries(); } },
      ].map((d) => (
        <AlertDialog key={String(d.label)} open={!!d.id} onOpenChange={(o) => !o && d.set(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {d.label}?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive hover:bg-destructive/90"
                onClick={async () => { await d.fn(); toast.success("Excluído!"); d.set(null); }}
              >Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function RecurringRow({ entry, onEdit, onDelete, onToggle }: { entry: RecurringEntry; onEdit: (e: RecurringEntry) => void; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors", !entry.active && "opacity-50")}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", entry.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
          {entry.type === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{entry.name}</p>
          <p className="text-xs text-muted-foreground">
            {entry.day_of_month ? `Todo dia ${entry.day_of_month}` : "Todo mês"}
            {!entry.active && " · Inativa"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn("text-sm font-semibold tabular-nums", entry.type === "income" ? "text-success" : "text-destructive")}>
          {entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onToggle}><RefreshCw className="h-4 w-4 mr-2" />{entry.active ? "Desativar" : "Ativar"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(entry)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function EmptyState({ icon, label, onAdd }: { icon: React.ReactNode; label: string; onAdd: () => void }) {
  return (
    <div className="rounded-2xl bg-card p-12 text-center border border-dashed border-border">
      <div className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3 flex items-center justify-center">{icon}</div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <Button variant="link" onClick={onAdd} className="mt-1">Adicionar agora</Button>
    </div>
  );
}
