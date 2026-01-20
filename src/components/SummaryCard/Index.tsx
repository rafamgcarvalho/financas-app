import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/src/utils/formatCurrency";

type SummaryCardProps = {
  title: string;
  amount: number;
  type: "income" | "expense" | "investment" | "balance";
};

const styles = {
  income: {
    gradient: "from-blue-500 to-blue-700",
    icon: ArrowUpCircle,
  },
  expense: {
    gradient: "from-red-500 to-red-700",
    icon: ArrowDownCircle,
  },
  investment: {
    gradient: "from-slate-500 to-slate-700",
    icon: TrendingUp,
  },
  balance: {
    gradient: "from-emerald-500 to-emerald-700",
    icon: Wallet,
  },
};

export function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const currentStyle = styles[type];
  const Icon = currentStyle.icon;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-linear-to-br ${currentStyle.gradient}
        shadow-md transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
      `}
    >
      {/* efeito de luz */}
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">
            {title}
          </p>

          <p className="mt-1 text-3xl font-bold text-white tracking-tight">
            {formatCurrency(amount)}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
          <Icon size={26} className="text-white" />
        </div>
      </div>
    </div>
  );
}
