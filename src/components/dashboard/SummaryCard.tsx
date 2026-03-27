import { LucideIcon } from "lucide-react";
// importação de mock removida para uso do Supabase
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-gradient-primary text-primary-foreground",
  success: "",
  warning: "",
  destructive: "",
};

const iconVariantStyles = {
  default: "bg-secondary text-muted-foreground",
  primary: "bg-primary-foreground/20 text-primary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  variant = "default",
}: SummaryCardProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in",
        variantStyles[variant],
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              isPrimary
                ? "text-primary-foreground/70"
                : "text-muted-foreground",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-2xl font-bold font-display tracking-tight",
              isPrimary ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {formatCurrency(value)}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconVariantStyles[variant],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            isPrimary
              ? "text-primary-foreground/70"
              : trendUp
                ? "text-success"
                : "text-destructive",
          )}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
