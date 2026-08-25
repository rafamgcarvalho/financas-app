"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Container } from "../Container/Index";
import { MonthSelector } from "../MonthSelector/Index";
import { SummaryCard } from "../SummaryCard/Index";
import { BudgetPanel } from "../BudgetPanel/Index";
import { TransactionsList } from "../TransactionsList/Index";
import { OutOfPeriodNotice } from "../OutOfPeriodNotice/Index";
import { FinancialChart } from "../FinancialChart/Index";
import { MonthlyComparisonChart } from "../MonthlyComparisonChart/Index";
import { CategoryPieChart } from "../CategoryPieChart/Index";
import { api } from "@/src/services/api";
import { useTransactions } from "@/src/contexts/TransactionsProvider";
import { formatMonthLabel, monthProgress, previousMonth } from "@/src/lib/dates";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { findCategory } from "@/src/lib/categories";
import { toKind } from "@/src/lib/transactionTheme";
import type { Transaction } from "@/src/models/TransactionModel";

type Totals = {
  income: number;
  expense: number;
  investment: number;
  balance: number;
};

function sumTotals(transactions: Transaction[]): Totals {
  const totals = { income: 0, expense: 0, investment: 0 };

  for (const transaction of transactions) {
    totals[toKind(transaction.type)] += Number(transaction.amount);
  }

  return { ...totals, balance: totals.income - (totals.expense + totals.investment) };
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="h-[152px] animate-shimmer rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[152px] animate-shimmer rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}

export function DashboardContent() {
  const { openTransaction, duplicateTransaction, refreshToken, notifyChange } = useTransactions();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [previousTotals, setPreviousTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ minDate?: string; maxDate?: string }>({});

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchRange = useCallback(async () => {
    try {
      setRange(await api.get("/transactions/range"));
    } catch (error) {
      console.error("Erro ao buscar range", error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    const previous = previousMonth(selectedDate.month, selectedDate.year);

    try {
      setLoading(true);

      // O mês anterior alimenta a comparação dos cards — sem ele, um total
      // isolado não diz se o mês foi bom ou ruim.
      const [current, before] = await Promise.all([
        api.get<Transaction[]>(`/transactions?month=${selectedDate.month}&year=${selectedDate.year}`),
        api
          .get<Transaction[]>(`/transactions?month=${previous.month}&year=${previous.year}`)
          .catch(() => [] as Transaction[]),
      ]);

      setTransactions(Array.isArray(current) ? current : []);
      setPreviousTotals(sumTotals(Array.isArray(before) ? before : []));
    } catch (error) {
      console.error("Erro ao carregar transações", error);
      setTransactions([]);
      setPreviousTotals(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshToken]);

  useEffect(() => {
    fetchRange();
  }, [fetchRange, refreshToken]);

  const totals = useMemo(() => sumTotals(transactions), [transactions]);

  const previousLabel = useMemo(() => {
    const previous = previousMonth(selectedDate.month, selectedDate.year);
    return formatMonthLabel(previous.month, previous.year).split(" ")[0].toLowerCase();
  }, [selectedDate]);

  /** Projeção linear do saldo no fim do mês e maior categoria de gasto. */
  const insight = useMemo(() => {
    const progress = monthProgress(selectedDate.month, selectedDate.year);
    const isPartial = progress > 0 && progress < 1;

    const byCategory: Record<string, number> = {};
    for (const transaction of transactions) {
      if (toKind(transaction.type) !== "expense") continue;
      const key = transaction.category || "outros";
      byCategory[key] = (byCategory[key] ?? 0) + Number(transaction.amount);
    }

    const [topCategory] = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    return {
      isPartial,
      projectedBalance: isPartial ? totals.income - (totals.expense + totals.investment) / progress : null,
      topCategory: topCategory
        ? { category: findCategory(topCategory[0]), amount: topCategory[1] }
        : null,
    };
  }, [transactions, totals, selectedDate]);

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

  const handleRefresh = () => {
    notifyChange();
  };

  return (
    <Container>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 sm:text-3xl">Resumo do mês</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatMonthLabel(selectedDate.month, selectedDate.year)} · visão geral das suas finanças
          </p>
        </div>

        <MonthSelector
          currentValue={dateValue}
          onChange={(month, year) => setSelectedDate({ month, year })}
          minDate={range.minDate}
          maxDate={range.maxDate}
        />
      </div>

      <OutOfPeriodNotice
        months={[selectedDate]}
        onGoToMonth={(month, year) => setSelectedDate({ month, year })}
      />

      {loading ? (
        <CardsSkeleton />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryCard
            variant="hero"
            title="Saldo do mês"
            amount={totals.balance}
            type="balance"
            previousAmount={previousTotals?.balance}
            previousLabel={previousLabel}
          />

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
            <SummaryCard
              title="Receitas"
              amount={totals.income}
              type="income"
              previousAmount={previousTotals?.income}
              previousLabel={previousLabel}
            />
            <SummaryCard
              title="Despesas"
              amount={totals.expense}
              type="expense"
              previousAmount={previousTotals?.expense}
              previousLabel={previousLabel}
            />
            <SummaryCard
              title="Investimentos"
              amount={totals.investment}
              type="investment"
              previousAmount={previousTotals?.investment}
              previousLabel={previousLabel}
            />
          </div>
        </div>
      )}

      {/* Leitura rápida do mês em andamento */}
      {!loading && (insight.projectedBalance !== null || insight.topCategory) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-sm">
          {insight.projectedBalance !== null && (
            <span className="flex items-center gap-2 text-slate-500">
              <TrendingUp size={15} className="text-brand-500" />
              No ritmo atual, o mês fecha em{" "}
              <strong className={insight.projectedBalance < 0 ? "text-expense-600" : "text-income-600"}>
                {formatCurrency(insight.projectedBalance)}
              </strong>
            </span>
          )}

          {insight.topCategory && (
            <span className="text-slate-500">
              Maior gasto:{" "}
              <strong className="text-navy-800">{insight.topCategory.category.label}</strong>{" "}
              ({formatCurrency(insight.topCategory.amount)})
            </span>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <BudgetPanel transactions={transactions} month={selectedDate.month} year={selectedDate.year} />
        <MonthlyComparisonChart month={selectedDate.month} year={selectedDate.year} />
        <CategoryPieChart month={selectedDate.month} year={selectedDate.year} />
      </div>

      <div className="mt-6">
        <FinancialChart refreshToken={refreshToken} />
      </div>

      <div className="mt-6">
        <TransactionsList
          type="all"
          title="Últimas transações"
          month={selectedDate.month}
          year={selectedDate.year}
          refreshToken={refreshToken}
          toolbar
          exportable
          onEdit={(transaction) => openTransaction({ transaction })}
          onDuplicate={duplicateTransaction}
          onCreate={() => openTransaction()}
          onRefresh={handleRefresh}
        />
      </div>
    </Container>
  );
}
