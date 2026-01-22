/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Container } from "@/src/components/Container/Index";
import { MonthSelector } from "@/src/components/MonthSelector/Index";
import { TransactionForm } from "@/src/components/TransactionForm/Index";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/src/services/api";

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

  const [range, setRange] = useState({
    minDate: undefined,
    maxDate: undefined,
  });

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

  const fetchRange = useCallback(async () => {
    try {
      const data = await api.get("/transactions/range?type=expense");
      setRange(data);
    } catch (error) {
      console.error("Erro ao buscar range de despesas", error);
    }
  }, []);

  useEffect(() => {
    fetchRange();
  }, [fetchRange, refreshKey]);

  useEffect(() => {
    if (!range.maxDate) return;

    const maxDate = new Date(range.maxDate);
    const selected = new Date(selectedDate.year, selectedDate.month - 1);

    if (selected > maxDate) {
      setSelectedDate({
        month: maxDate.getMonth() + 1,
        year: maxDate.getFullYear(),
      });
    }
  }, [range, selectedDate]);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Despesas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle e acompanhe todos os seus gastos
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {editingTransaction ? "Editar Despesa" : "Adicionar Nova Despesa"}
          </h2>

          <TransactionForm
            type="expense"
            buttonLabel="Salvar Despesa"
            categories={categories}
            onSuccess={handleSuccess}
            initialData={editingTransaction}
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Histórico de Despesas
            </h2>

            <MonthSelector
              currentValue={dateValue}
              onChange={(month, year) => setSelectedDate({ month, year })}
              minDate={range.minDate}
              maxDate={range.maxDate}
            />
          </div>

          <TransactionsList
            key={`${refreshKey}-${dateValue}`}
            type="expense"
            exibirAcoes={true}
            onEdit={handleEdit}
            onRefresh={handleSuccess}
            month={selectedDate.month}
            year={selectedDate.year}
          />
        </div>
      </div>
    </Container>
  );
}
