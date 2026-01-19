"use client";

import { TransactionModel } from "@/src/models/IncomeModel";
import { Container } from "../Container/Index";
import { MonthSelector } from "../MonthSelector/Index";
import { useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { SummaryCard } from "../SummaryCard/Index";
import { SpinLoader } from "../SpinLoader/Index";

export function DashboardContent() {
  const [transactions, setTransactions] = useState<TransactionModel[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/transactions?month=${selectedDate.month}&year=${selectedDate.year}`);

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

  // console.log("Total incomes: ", totalIncomes);

  const totalExpenses = transactions
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncomes - totalExpenses;

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;

  return (
    <Container>
      {/* 1. Cabeçalho da Página */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Resumo do Dashboard
      </h1>

      <MonthSelector currentValue={dateValue} onChange={(month, year) => setSelectedDate({ month, year })} />

      {/* 2. Área de Cartões/Estatísticas */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-8">

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
          amount={1200}
          type="investment"
        />

        <SummaryCard 
          title="Balanço" 
          amount={balance} 
          type="balance" 
        />
      </div>

      {/* 3. Área de Gráficos/Tabelas */}
      <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Fluxo de Caixa Mensal
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          [Placeholder para Gráfico ou Tabela]
        </div>
      </div>
    </Container>
  );
}
