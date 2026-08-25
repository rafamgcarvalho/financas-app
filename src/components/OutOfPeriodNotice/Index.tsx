"use client";

import { useMemo } from "react";
import { CalendarClock, X } from "lucide-react";
import { useTransactions } from "@/src/contexts/TransactionsProvider";
import { formatMonthLabel } from "@/src/lib/dates";

type OutOfPeriodNoticeProps = {
  /** Meses atualmente visíveis na tela. */
  months: { month: number; year: number }[];
  /** Leva a tela até o mês do lançamento. */
  onGoToMonth: (month: number, year: number) => void;
};

/**
 * Avisa quando o lançamento recém-salvo caiu fora do período exibido.
 *
 * Sem isto, lançar uma compra antiga (a primeira parcela em junho, por exemplo)
 * mostrava um toast de sucesso e nada mais: a transação não aparecia na lista
 * do mês atual e não havia como saber se tinha sido gravada.
 */
export function OutOfPeriodNotice({ months, onGoToMonth }: OutOfPeriodNoticeProps) {
  const { lastSaved, dismissLastSaved } = useTransactions();

  const target = useMemo(() => {
    if (!lastSaved) return null;

    const saved = new Date(`${lastSaved.date}T12:00:00`);
    if (Number.isNaN(saved.getTime())) return null;

    const month = saved.getMonth() + 1;
    const year = saved.getFullYear();

    // Dentro do período exibido? Então a lista já mostra o lançamento.
    if (months.some((period) => period.month === month && period.year === year)) return null;

    return { month, year };
  }, [lastSaved, months]);

  if (!lastSaved || !target) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <CalendarClock size={18} className="shrink-0 text-amber-600" />

      <p className="min-w-0 flex-1 text-sm text-amber-900">
        <strong>{lastSaved.title}</strong> foi salvo em{" "}
        {formatMonthLabel(target.month, target.year).toLowerCase()}, fora do período exibido.
      </p>

      <button
        onClick={() => {
          onGoToMonth(target.month, target.year);
          dismissLastSaved();
        }}
        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 cursor-pointer"
      >
        Ver esse mês
      </button>

      <button
        onClick={dismissLastSaved}
        aria-label="Dispensar aviso"
        className="rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-100 cursor-pointer"
      >
        <X size={15} />
      </button>
    </div>
  );
}
