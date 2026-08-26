"use client";

import { useState } from "react";
import { Modal } from "../Modal/Index";
import { CategoryPill } from "../CategoryPill/Index";
import { CurrencyInput } from "../CurrencyInput/Index";
import { setBudget, type BudgetMap } from "@/src/lib/budgets";
import { useCategories } from "@/src/hooks/useCategories";
import { digitsToNumber, numberToDigits } from "@/src/lib/money";
import { formatCurrency } from "@/src/utils/formatCurrency";

type BudgetEditorProps = {
  isOpen: boolean;
  onClose: () => void;
  budgets: BudgetMap;
  /** Gasto do mês por categoria, para dar referência ao definir o teto. */
  spentByCategory?: Record<string, number>;
};

export function BudgetEditor({ isOpen, onClose, budgets, spentByCategory = {} }: BudgetEditorProps) {
  // O formulário só existe enquanto o modal está aberto, então cada abertura o
  // remonta com os valores salvos — sem efeito para ressincronizar.
  if (!isOpen) return null;

  return (
    <BudgetEditorForm onClose={onClose} budgets={budgets} spentByCategory={spentByCategory} />
  );
}

function BudgetEditorForm({
  onClose,
  budgets,
  spentByCategory,
}: {
  onClose: () => void;
  budgets: BudgetMap;
  spentByCategory: Record<string, number>;
}) {
  const { categories } = useCategories("expense");

  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(budgets).map(([value, limit]) => [value, numberToDigits(limit)])),
  );

  const total = categories.reduce((acc, category) => acc + digitsToNumber(drafts[category.value] ?? ""), 0);

  const handleSave = () => {
    for (const category of categories) {
      setBudget(category.value, digitsToNumber(drafts[category.value] ?? ""));
    }

    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Orçamento por categoria"
      subtitle="Deixe em branco para não acompanhar a categoria."
      size="md"
    >
      <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
        {categories.map((category) => {
          const spent = spentByCategory[category.value] ?? 0;

          return (
            <div key={category.value} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <CategoryPill category={category} size="md" />
                {spent > 0 && (
                  <p className="mt-1 text-[11px] text-slate-400">Gasto este mês: {formatCurrency(spent)}</p>
                )}
              </div>

              <CurrencyInput
                size="sm"
                className="w-36 shrink-0"
                value={drafts[category.value] ?? ""}
                onChange={(digits) =>
                  setDrafts((prev) => ({ ...prev, [category.value]: digits }))
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
        <div className="mr-auto text-xs text-slate-500">
          Total planejado
          <strong className="ml-1 text-navy-800">{formatCurrency(total)}</strong>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </Modal>
  );
}
