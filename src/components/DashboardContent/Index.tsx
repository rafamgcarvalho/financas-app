"use client";

import { TransactionModel } from "@/src/models/IncomeModel";
import { Container } from "../Container/Index";
import { MonthSelector } from "../MonthSelector/Index";
import { useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { SummaryCard } from "../SummaryCard/Index";
import { SpinLoader } from "../SpinLoader/Index";
import UserDropdown from "../UserDropdown/Index";

export function DashboardContent() {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.get(
          `/transactions?month=${selectedDate.month}&year=${selectedDate.year}`
        );
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar transações", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedDate]);

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

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(
    2,
    "0"
  )}`;

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Resumo do Dashboard
          </h1>

          <p className="text-sm text-gray-500">
            Visão geral das suas finanças
          </p>

          <div className="mt-8">
            <MonthSelector
              currentValue={dateValue}
              onChange={(month, year) =>
                setSelectedDate({ month, year })
              }
            />
          </div>
        </div>

        <UserDropdown />
      </div>

      {/* Cards */}
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

        <SummaryCard
          title="Balanço"
          amount={balance}
          type="balance"
        />
      </div>

      {/* Gráfico / Tabela */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Fluxo de Caixa Mensal
          </h2>
        </div>

        <div className="flex h-72 items-center justify-center text-sm text-gray-400">
          [Placeholder para Gráfico ou Tabela]
        </div>
      </div>
    </Container>
  );
}
