"use client";

import { TransactionModel } from "@/src/models/IncomeModel";
import { Container } from "../Container/Index";
import { MonthSelector } from "../MonthSelector/Index";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { SummaryCard } from "../SummaryCard/Index";
import { SpinLoader } from "../SpinLoader/Index";
import UserDropdown from "../UserDropdown/Index";
import { TransactionsList } from "../TransactionsList/Index";

export function DashboardContent() {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState({
    minDate: undefined,
    maxDate: undefined,
  });

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchRange = useCallback(async () => {
    try {
      const data = await api.get("/transactions/range");
      setRange(data);
    } catch (error) {
      console.error("Erro ao buscar range", error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(
        `/transactions?month=${selectedDate.month}&year=${selectedDate.year}`,
      );
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchRange();
  }, [fetchRange]);

  const handleRefresh = () => {
    fetchTransactions();
    fetchRange();
  };

  if (loading) {
    return (
      <Container>
        <SpinLoader className="min-h-[400px]" />
      </Container>
    );
  }

  const totalIncomes = transactions
    .filter((t) => t.type?.toLowerCase() === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncomes - totalExpenses;

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

  return (
    <Container>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Resumo do Dashboard
          </h1>
          <p className="text-sm text-gray-500">Visão geral das suas finanças</p>

          <div className="mt-8">
            <MonthSelector
              currentValue={dateValue}
              onChange={(month, year) => setSelectedDate({ month, year })}
              minDate={range.minDate}
              maxDate={range.maxDate}
            />
          </div>
        </div>
        <UserDropdown />
      </div>

      {/* Cards de resumo... */}
      <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        <SummaryCard
          title="Receitas Totais"
          amount={totalIncomes}
          type="income"
        />
        <SummaryCard
          title="Despesas Totais"
          amount={totalExpenses}
          type="expense"
        />
        <SummaryCard
          title="Investimentos Totais"
          amount={0}
          type="investment"
        />
        <SummaryCard title="Balanço" amount={balance} type="balance" />
      </div>

      {/* Lista de transações */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm mt-8">
        <TransactionsList
          month={selectedDate.month}
          year={selectedDate.year}
          onRefresh={handleRefresh}
        />
      </div>
    </Container>
  );
}
