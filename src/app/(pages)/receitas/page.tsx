 "use client";

import { Container } from "@/src/components/Container/Index";
import { useState } from "react";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { TransactionForm } from "@/src/components/TransactionForm/Index";

const categories = [
  { value: "salario", label: "Salário" },
  { value: "investimento", label: "Investimento" },
  { value: "freelance", label: "Freelance" },
  { value: "outros", label: "Outros" },
];

export default function ReceitasPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container>
      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Adicionar Nova Receita
        </h2>

        <TransactionForm type="income" buttonLabel="Salvar Receita" categories={categories} onSuccess={handleSuccess}></TransactionForm>

        <hr className="my-10 border-gray-100" />

        <TransactionsList key={refreshKey} type="income" exibirAcoes={true}></TransactionsList>
      </div>
    </Container>
  );
}
