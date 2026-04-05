import { useEffect, useState } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    // Total balance from non-credit accounts
    supabase
      .from("accounts")
      .select("balance, type")
      .then(({ data }) => {
        if (data) {
          const total = data
            .filter((a) => a.type !== "credit")
            .reduce((s, a) => s + (a.balance || 0), 0);
          setBalance(total);
        }
      });

    // Monthly income and expenses
    supabase
      .from("transactions")
      .select("amount, type")
      .gte("date", firstDay)
      .then(({ data }) => {
        if (data) {
          const income = data
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0);
          const expenses = data
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + t.amount, 0);
          setTotalIncome(income);
          setTotalExpenses(expenses);
        }
      });
  }, []);

  const savings = totalIncome - totalExpenses;
  const savingsPct =
    totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          Visao Geral
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe suas financas em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Saldo Total"
          value={balance}
          icon={Wallet}
          variant="primary"
        />
        <SummaryCard
          title="Receitas do mês"
          value={totalIncome}
          icon={TrendingUp}
          variant="success"
        />
        <SummaryCard
          title="Despesas do mês"
          value={totalExpenses}
          icon={TrendingDown}
          variant="destructive"
        />
        <SummaryCard
          title="Economia"
          value={savings > 0 ? savings : 0}
          icon={PiggyBank}
          variant="warning"
          trend={totalIncome > 0 ? `${savingsPct}% da receita` : undefined}
          trendUp={savings > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>
        <ExpenseChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <UpcomingBills />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EvolutionChart />
        <GoalsPreview />
      </div>
    </div>
  );
};

export default Dashboard;
