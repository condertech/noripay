import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { GoalsPreview } from "@/components/dashboard/GoalsPreview";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

const Dashboard = () => {
  const totalIncome = 11700;
  const totalExpenses = 4635.20;
  const balance = 33110.30;
  const savings = totalIncome - totalExpenses;

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
          trend="+12.5% vs mes anterior"
          trendUp
        />
        <SummaryCard
          title="Receitas"
          value={totalIncome}
          icon={TrendingUp}
          variant="success"
          trend="+R$ 2.900 extras"
          trendUp
        />
        <SummaryCard
          title="Despesas"
          value={totalExpenses}
          icon={TrendingDown}
          variant="destructive"
          trend="-8.3% vs mes anterior"
          trendUp
        />
        <SummaryCard
          title="Economia"
          value={savings}
          icon={PiggyBank}
          variant="warning"
          trend="60.4% do salario"
          trendUp
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
