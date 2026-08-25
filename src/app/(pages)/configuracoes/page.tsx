"use client";

import { useState } from "react";
import { Keyboard, PiggyBank, Settings2 } from "lucide-react";
import { Container } from "@/src/components/Container/Index";
import { CategoryManager } from "@/src/components/CategoryManager/Index";
import { BudgetEditor } from "@/src/components/BudgetEditor/Index";
import { CategoryPill } from "@/src/components/CategoryPill/Index";
import { BUDGETS_KEY, type BudgetMap } from "@/src/lib/budgets";
import { useLocalStore } from "@/src/hooks/useLocalStore";
import { findCategory } from "@/src/lib/categories";
import { formatCurrency } from "@/src/utils/formatCurrency";

const NO_BUDGETS: BudgetMap = {};

const SHORTCUTS = [
  { keys: "N", description: "Abrir um novo lançamento" },
  { keys: "Esc", description: "Fechar a janela aberta" },
  { keys: "Enter", description: "Salvar o formulário" },
];

export default function ConfiguracoesPage() {
  const budgets = useLocalStore<BudgetMap>(BUDGETS_KEY, NO_BUDGETS);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const entries = Object.entries(budgets);
  const total = entries.reduce((acc, [, limit]) => acc + limit, 0);

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800 sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-sm text-slate-500">Ajuste o app ao seu jeito de organizar as contas</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryManager />

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
                  <PiggyBank size={18} className="text-brand-500" />
                  Orçamento mensal
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {entries.length > 0
                    ? `${entries.length} categorias · ${formatCurrency(total)} planejados por mês`
                    : "Nenhum teto definido ainda"}
                </p>
              </div>

              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <Settings2 size={14} />
                Editar
              </button>
            </div>

            {entries.length > 0 && (
              <ul className="mt-4 space-y-2">
                {entries
                  .sort((a, b) => b[1] - a[1])
                  .map(([value, limit]) => (
                    <li key={value} className="flex items-center justify-between gap-3">
                      <CategoryPill category={findCategory(value)} />
                      <span className="text-sm font-semibold tabular-nums text-navy-800">
                        {formatCurrency(limit)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-navy-800">
              <Keyboard size={18} className="text-brand-500" />
              Atalhos de teclado
            </h2>

            <ul className="mt-4 space-y-2.5">
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.keys} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{shortcut.description}</span>
                  <kbd className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-sans text-xs font-semibold text-slate-500">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-navy-800">Instalar no celular</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Abra este site no navegador do celular e escolha{" "}
              <strong className="text-navy-800">Adicionar à tela de início</strong>. O app ganha ícone
              próprio e abre em tela cheia — lançar uma despesa na hora da compra passa a ser dois
              toques.
            </p>
          </section>
        </div>
      </div>

      <BudgetEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        budgets={budgets}
      />
    </Container>
  );
}
