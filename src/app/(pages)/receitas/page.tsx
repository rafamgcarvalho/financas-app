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

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
  };

  return (
    <Container>
      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingTransaction ? "Editar Receita" : "Adicionar Nova Receita"}
        </h2>

        <TransactionForm
          type="income"
          buttonLabel="Salvar Receita"
          categories={categories}
          onSuccess={handleSuccess}
          initialData={editingTransaction}
        ></TransactionForm>

        <hr className="my-10 border-gray-100" />

        <MonthSelector 
            currentValue={dateValue}
            onChange={(month, year) => setSelectedDate({ month, year })}
        />

        <TransactionsList
          key={`${refreshKey}-${dateValue}`}
          type="income"
          exibirAcoes={true}
          onEdit={handleEdit}
          month={selectedDate.month}
          year={selectedDate.year}
        ></TransactionsList>
      </div>
    </Container>
  );
}
