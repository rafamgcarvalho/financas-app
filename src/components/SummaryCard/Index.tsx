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
    iconBg: "bg-blue-100 text-blue-600",
    text: "text-blue-100",
  },
  expense: {
    gradient: "from-red-500 to-red-700",
    icon: ArrowDownCircle,
    iconBg: "bg-red-100 text-red-600",
    text: "text-red-100",
  },
  investment: {
    gradient: "from-slate-500 to-slate-700",
    icon: TrendingUp,
    iconBg: "bg-slate-100 text-slate-600",
    text: "text-slate-100",
  },
  balance: {
    gradient: "from-emerald-500 to-emerald-700",
    icon: Wallet,
    iconBg: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-100",
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
        shadow-lg transition-all duration-300
        hover:-translate-y-1 hover:shadow-2xl
      `}
    >
      {/* brilho decorativo */}
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${currentStyle.text}`}>
            {title}
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {formatCurrency(amount)}
          </p>
        </div>

        <div
          className={`
            flex h-12 w-12 items-center justify-center
            rounded-xl ${currentStyle.iconBg}
          `}
        >
          <Icon size={26} />
        </div>
      </div>
    </div>
  );
}
