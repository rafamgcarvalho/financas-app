"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "../Container/Index";
import { TransactionsList } from "../TransactionsList/Index";
import {
  PeriodSelector,
  periodLabel,
  periodsBetween,
  presetRange,
  type Period,
  type PeriodPreset,
} from "../PeriodSelector/Index";
import { api } from "@/src/services/api";
import { useTransactions } from "@/src/contexts/TransactionsProvider";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { findCategory } from "@/src/lib/categories";
import { TYPE_THEME } from "@/src/lib/transactionTheme";
import type { Transaction, TransactionKind } from "@/src/models/TransactionModel";

type TransactionsPageViewProps = {
  type: Exclude<TransactionKind, "investment"> | TransactionKind;
  title: string;
  subtitle: string;
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 truncate text-lg font-bold text-navy-800 sm:text-xl">{value}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/**
 * Tela de listagem de um tipo de transação.
 *
 * Receitas e Despesas eram dois arquivos quase idênticos, cada um com o
 * formulário fixo ocupando a primeira dobra. Agora a página é só consulta — o
 * lançamento acontece no modal global — e as duas rotas compartilham este
 * componente.
 */
export function TransactionsPageView({ type, title, subtitle }: TransactionsPageViewProps) {
  const { openTransaction, duplicateTransaction, refreshToken, notifyChange } = useTransactions();

  const [range, setRange] = useState<{ minDate?: string; maxDate?: string }>({});
  const [loaded, setLoaded] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<{ preset: PeriodPreset; from: Period; to: Period }>(() => ({
    preset: "current",
    ...presetRange("current"),
  }));

  const theme = TYPE_THEME[type];

  // Atalho da tela inicial do celular: /despesas?novo=expense abre o modal.
  // Lido de window em vez de useSearchParams para não exigir <Suspense>.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("novo")) return;

    openTransaction({ type });

    // Limpa a query para que um F5 não reabra o modal.
    window.history.replaceState(null, "", window.location.pathname);
    // Só na montagem: reabrir a cada render prenderia o usuário no modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api
      .get<{ minDate?: string; maxDate?: string }>(`/transactions/range?type=${type}`)
      .then(setRange)
      .catch((error) => console.error("Erro ao buscar período disponível", error));
  }, [type, refreshToken]);

  const months = useMemo(() => periodsBetween(period.from, period.to), [period]);

  const stats = useMemo(() => {
    const total = loaded.reduce((acc, item) => acc + Number(item.amount), 0);
    const biggest = loaded.reduce<Transaction | null>(
      (max, item) => (!max || Number(item.amount) > Number(max.amount) ? item : max),
      null,
    );

    const byCategory: Record<string, number> = {};
    for (const item of loaded) {
      const key = item.category || "outros";
      byCategory[key] = (byCategory[key] ?? 0) + Number(item.amount);
    }
    const [top] = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    return {
      total,
      average: months.length ? total / months.length : total,
      biggest,
      topCategory: top ? { category: findCategory(top[0]), amount: top[1] } : null,
    };
  }, [loaded, months.length]);

  const handleLoaded = useCallback((transactions: Transaction[]) => setLoaded(transactions), []);

  return (
    <Container>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <button
          onClick={() => openTransaction({ type })}
          className="hidden items-center gap-2 rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 sm:flex cursor-pointer"
        >
          <Plus size={16} />
          Nova {theme.label.toLowerCase()}
        </button>
      </div>

      <div className="mb-5">
        <PeriodSelector
          value={period}
          onChange={setPeriod}
          minDate={range.minDate}
          maxDate={range.maxDate}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          label={`Total em ${theme.plural.toLowerCase()}`}
          value={formatCurrency(stats.total)}
          hint={periodLabel(period.preset, period.from, period.to)}
        />
        <Stat
          label="Média mensal"
          value={formatCurrency(stats.average)}
          hint={`${months.length} ${months.length === 1 ? "mês" : "meses"} no período`}
        />
        <Stat
          label="Maior lançamento"
          value={stats.biggest ? formatCurrency(Number(stats.biggest.amount)) : "—"}
          hint={stats.biggest?.title}
        />
        <Stat
          label="Categoria principal"
          value={stats.topCategory?.category.label ?? "—"}
          hint={stats.topCategory ? formatCurrency(stats.topCategory.amount) : undefined}
        />
      </div>

      <TransactionsList
        type={type}
        months={months}
        refreshToken={refreshToken}
        toolbar
        exportable
        title={`Histórico de ${theme.plural.toLowerCase()}`}
        onEdit={(transaction) => openTransaction({ transaction })}
        onDuplicate={duplicateTransaction}
        onCreate={() => openTransaction({ type })}
        onRefresh={notifyChange}
        onLoaded={handleLoaded}
      />
    </Container>
  );
}
