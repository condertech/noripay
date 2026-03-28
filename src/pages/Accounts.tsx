// importações de mock removidas para uso do Supabase
import { CreditCard, Building2, Wallet, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  checking: Building2,
  savings: PiggyBank,
  wallet: Wallet,
  credit: CreditCard,
};

const typeLabels = {
  checking: "Conta Corrente",
  savings: "Poupanca",
  wallet: "Carteira",
  credit: "Cartao de Credito",
};

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("accounts").select("*");
      if (!error) setAccounts(data || []);
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  const totalBalance = accounts
    .filter((a) => a.type !== "credit")
    .reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          Contas e Cartoes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Patrimonio total: {formatCurrency(totalBalance)}
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Carregando contas...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
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
                    <span>Fecha dia {acc.closingDay}</span>
                    <span>Vence dia {acc.dueDay}</span>
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
    </div>
  );
};

export default Accounts;
