import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CalendarDays, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

type TxItem = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: string;
  category?: string;
};

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario() {
  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

    supabase
      .from("transactions")
      .select("id, title, amount, type, date, status, category")
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date", { ascending: true })
      .then(({ data }) => setTransactions(data || []));
  }, [currentMonth]);

  const { year, month } = currentMonth;
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const txByDate: Record<string, TxItem[]> = {};
  for (const tx of transactions) {
    if (!txByDate[tx.date]) txByDate[tx.date] = [];
    txByDate[tx.date].push(tx);
  }

  const selectedTxs = selectedDate ? txByDate[selectedDate] || [] : [];

  const prevMonth = () =>
    setCurrentMonth(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 };
      return { year, month: month - 1 };
    });

  const nextMonth = () =>
    setCurrentMonth(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 };
      return { year, month: month + 1 };
    });

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          Calendário
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize suas transações por dia
        </p>
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-card">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="rounded-lg p-2 hover:bg-secondary transition-colors text-muted-foreground"
          >
            ‹
          </button>
          <h2 className="font-display font-semibold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg p-2 hover:bg-secondary transition-colors text-muted-foreground"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTxs = txByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  "relative flex flex-col items-center justify-start rounded-xl p-1.5 min-h-[52px] text-sm transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-secondary text-foreground",
                )}
              >
                <span className="font-medium">{day}</span>
                {dayTxs.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayTxs.slice(0, 3).map((tx) => (
                      <span
                        key={tx.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          tx.type === "income"
                            ? "bg-success"
                            : "bg-destructive",
                          isSelected && "bg-primary-foreground",
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day transactions */}
      {selectedDate && (
        <div className="rounded-2xl bg-card p-5 shadow-card animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {selectedTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma transação neste dia
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3 bg-secondary/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
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
                        {tx.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        tx.type === "income"
                          ? "text-success"
                          : "text-foreground",
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}{" "}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        tx.status === "paid"
                          ? "text-success"
                          : tx.status === "pending"
                            ? "text-warning"
                            : "text-destructive",
                      )}
                    >
                      {tx.status === "paid"
                        ? "Pago"
                        : tx.status === "pending"
                          ? "Pendente"
                          : "Atrasado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
