import { ArrowDownRight, ArrowUpRight, Minus, Wallet } from "lucide-react";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { percentChange } from "@/src/lib/money";
import { TYPE_THEME } from "@/src/lib/transactionTheme";
import type { TransactionKind } from "@/src/models/TransactionModel";

type SummaryCardType = TransactionKind | "balance";

type SummaryCardProps = {
  title: string;
  amount: number;
  type: SummaryCardType;
  /** Mesmo total no mês anterior — sem ele o card não mostra comparação. */
  previousAmount?: number;
  previousLabel?: string;
  variant?: "hero" | "compact";
};

/** Uma variação é "boa" quando aumenta receita/investimento ou reduz despesa. */
function isPositiveChange(type: SummaryCardType, change: number): boolean {
  if (type === "expense") return change < 0;
  return change > 0;
}

function DeltaBadge({
  type,
  amount,
  previousAmount,
  previousLabel,
  tone,
}: {
  type: SummaryCardType;
  amount: number;
  previousAmount?: number;
  previousLabel?: string;
  tone: "light" | "dark";
}) {
  if (previousAmount === undefined) return null;

  const change = percentChange(amount, previousAmount);

  // Sem base de comparação (mês anterior zerado) não há percentual honesto.
  if (change === null) {
    return (
      <p className={`mt-2 text-xs ${tone === "dark" ? "text-white/60" : "text-slate-400"}`}>
        Sem dados em {previousLabel ?? "mês anterior"}
      </p>
    );
  }

  const rounded = Math.round(Math.abs(change));
  const good = isPositiveChange(type, change);
  const Icon = rounded === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;

  const color =
    tone === "dark"
      ? "text-white/80"
      : rounded === 0
        ? "text-slate-400"
        : good
          ? "text-income-600"
          : "text-expense-600";

  return (
    <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={14} />
      {rounded === 0 ? "estável" : `${rounded}%`}
      <span className={tone === "dark" ? "font-normal text-white/50" : "font-normal text-slate-400"}>
        vs. {previousLabel ?? "mês anterior"}
      </span>
    </p>
  );
}

/**
 * Card de total do período.
 *
 * `hero` é o saldo — o número que responde "como foi o mês". Os demais usam
 * `compact`, mais discretos, para não competirem todos pela mesma atenção.
 */
export function SummaryCard({
  title,
  amount,
  type,
  previousAmount,
  previousLabel,
  variant = "compact",
}: SummaryCardProps) {
  const theme = type === "balance" ? null : TYPE_THEME[type];
  const Icon = theme?.icon ?? Wallet;

  if (variant === "hero") {
    const negative = amount < 0;

    return (
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-navy-600 to-navy-800 p-6 shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Icon size={20} className="text-white" />
            </div>
          </div>

          <p className="mt-2 text-4xl font-bold tracking-tight text-white">{formatCurrency(amount)}</p>

          <div className="flex items-center gap-3">
            <DeltaBadge
              type={type}
              amount={amount}
              previousAmount={previousAmount}
              previousLabel={previousLabel}
              tone="dark"
            />
          </div>

          {negative && (
            <p className="mt-3 inline-flex rounded-lg bg-expense-500/20 px-2.5 py-1 text-xs font-medium text-expense-100">
              Você gastou mais do que recebeu neste mês
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme?.soft ?? "bg-slate-100"}`}>
          <Icon size={18} className={theme?.text ?? "text-slate-500"} />
        </div>
      </div>

      <p className={`mt-2 text-2xl font-bold tracking-tight ${theme?.text ?? "text-navy-800"}`}>
        {formatCurrency(amount)}
      </p>

      <DeltaBadge
        type={type}
        amount={amount}
        previousAmount={previousAmount}
        previousLabel={previousLabel}
        tone="light"
      />
    </div>
  );
}
