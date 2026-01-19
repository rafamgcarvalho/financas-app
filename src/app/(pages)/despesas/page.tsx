/* eslint-disable @typescript-eslint/no-explicit-any */
 "use client";

import { Container } from "@/src/components/Container/Index";
import { TransactionForm } from "@/src/components/TransactionForm/Index";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { useState } from "react";

const categories = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "moradia", label: "Moradia (Aluguel/Luz)" },
  { value: "transporte", label: "Transporte" },
  { value: "lazer", label: "Lazer" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "outros", label: "Outros" },
];

export default function DespesasPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingTransaction(null);
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
  }

  return (
    <Container>
      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingTransaction ? "Editar Despesa" : "Adicionar Nova Despesa"}
        </h2>

        <TransactionForm type="expense" buttonLabel="Salvar Despesa" categories={categories} onSuccess={handleSuccess} initialData={editingTransaction}></TransactionForm>

        <hr className="my-10 border-gray-100" />

        <TransactionsList key={refreshKey} type="expense" exibirAcoes={true} onEdit={handleEdit}></TransactionsList>
      </div>
    </Container>
  );
}
