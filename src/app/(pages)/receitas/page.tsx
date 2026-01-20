/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Container } from "@/src/components/Container/Index";
import { useState } from "react";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { TransactionForm } from "@/src/components/TransactionForm/Index";
import { MonthSelector } from "@/src/components/MonthSelector/Index";

const categories = [
  { value: "salario", label: "Salário" },
  { value: "investimento", label: "Investimento" },
  { value: "freelance", label: "Freelance" },
  { value: "outros", label: "Outros" },
];

export default function ReceitasPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
  };

  return (
    <Container>
      <div className="flex flex-col gap-8">

        {/* 🔹 Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Receitas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie e acompanhe todas as suas entradas financeiras
          </p>
        </div>

        {/* 🔹 Card do Formulário */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {editingTransaction ? "Editar Receita" : "Adicionar Nova Receita"}
          </h2>

          <TransactionForm
            type="income"
            buttonLabel="Salvar Receita"
            categories={categories}
            onSuccess={handleSuccess}
            initialData={editingTransaction}
          />
        </div>

        {/* 🔹 Card da Lista */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

          {/* Cabeçalho da lista + filtro */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Histórico de Receitas
            </h2>

            <MonthSelector
              currentValue={dateValue}
              onChange={(month, year) => setSelectedDate({ month, year })}
            />
          </div>

          <TransactionsList
            key={`${refreshKey}-${dateValue}`}
            type="income"
            exibirAcoes={true}
            onEdit={handleEdit}
            month={selectedDate.month}
            year={selectedDate.year}
          />
        </div>

      </div>
    </Container>
  );
}
