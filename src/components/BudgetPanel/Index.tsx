"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, PiggyBank, Settings2 } from "lucide-react";
import { BudgetEditor } from "../BudgetEditor/Index";
import { CategoryPill } from "../CategoryPill/Index";
import { budgetStatus, BUDGETS_KEY, type BudgetMap } from "@/src/lib/budgets";
import { useLocalStore } from "@/src/hooks/useLocalStore";
import { findCategory } from "@/src/lib/categories";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { monthProgress } from "@/src/lib/dates";
import { toKind } from "@/src/lib/transactionTheme";
import type { Transaction } from "@/src/models/TransactionModel";

type BudgetPanelProps = {
  transactions: Transaction[];
  month: number;
  year: number;
};

const NO_BUDGETS: BudgetMap = {};

const STATUS_STYLES = {
  ok: { bar: "bg-income-500", text: "text-slate-500" },
  warning: { bar: "bg-amber-500", text: "text-amber-600" },
  exceeded: { bar: "bg-expense-500", text: "text-expense-600" },
};

/**
 * Orçamento mensal por categoria.
 *
 * Transforma o histórico em controle: além de mostrar quanto foi gasto, compara
 * com o limite definido e avisa quando o ritmo do mês vai estourar.
 */
export function BudgetPanel({ transactions, month, year }: BudgetPanelProps) {
  // Ler direto do store mantém o painel em sincronia com o editor e com a
  // página de configurações, sem estado duplicado.
  const budgets = useLocalStore<BudgetMap>(BUDGETS_KEY, NO_BUDGETS);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const spentByCategory = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const transaction of transactions) {
      if (toKind(transaction.type) !== "expense") continue;
      const key = transaction.category || "outros";
      totals[key] = (totals[key] ?? 0) + Number(transaction.amount);
    }

    return totals;
  }, [transactions]);

  const rows = useMemo(() => {
    const progress = monthProgress(month, year);

    return Object.entries(budgets)
      .map(([value, limit]) => {
        const spent = spentByCategory[value] ?? 0;
        // Projeção linear: no ritmo atual, quanto fecha o mês.
        const projected = progress > 0 && progress < 1 ? spent / progress : spent;

        return {
          category: findCategory(value),
          limit,
          spent,
          projected,
          ratio: limit > 0 ? spent / limit : 0,
          status: budgetStatus(spent, limit),
          willExceed: projected > limit && spent <= limit,
        };
      })
      .sort((a, b) => b.ratio - a.ratio);
  }, [budgets, spentByCategory, month, year]);

  const totalLimit = rows.reduce((acc, row) => acc + row.limit, 0);
  const totalSpent = rows.reduce((acc, row) => acc + row.spent, 0);

  return (
    <section className="flex h-[380px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy-800">
            <PiggyBank size={18} className="text-brand-500" />
            Orçamento do mês
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {rows.length > 0
              ? `${formatCurrency(totalSpent)} de ${formatCurrency(totalLimit)} planejados`
              : "Defina um teto de gastos por categoria"}
          </p>
        </div>

        <button
          onClick={() => setIsEditorOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
        >
          <Settings2 size={14} />
          Definir
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center">
          <p className="max-w-[15rem] text-xs text-slate-400">
            Nenhum orçamento definido. Um teto por categoria mostra, no meio do mês, se
            o gasto está no ritmo certo.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex-1 space-y-3.5 overflow-y-auto pr-1">
          {rows.map((row) => {
            const styles = STATUS_STYLES[row.status];

            return (
              <li key={row.category.value}>
                <div className="flex items-center justify-between gap-2">
                  <CategoryPill category={row.category} />
                  <span className="text-xs tabular-nums text-slate-500">
                    <strong className={styles.text}>{formatCurrency(row.spent)}</strong>
                    {" / "}
                    {formatCurrency(row.limit)}
                  </span>
                </div>

                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${styles.bar}`}
                    style={{ width: `${Math.min(row.ratio * 100, 100)}%` }}
                  />
                </div>

                {row.status === "exceeded" && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-expense-600">
                    <AlertTriangle size={11} />
                    Estourou {formatCurrency(row.spent - row.limit)}
                  </p>
                )}

                {row.status !== "exceeded" && row.willExceed && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                    <AlertTriangle size={11} />
                    No ritmo atual fecha em {formatCurrency(row.projected)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <BudgetEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        budgets={budgets}
        spentByCategory={spentByCategory}
      />
    </section>
  );
}
