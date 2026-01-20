/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TransactionModel } from "@/src/models/IncomeModel";
import { api } from "@/src/services/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

interface TransactionFormProps {
  type: "income" | "expense" | "investment";
  buttonLabel: string;
  categories: { value: string; label: string }[];
  onSuccess: () => void;
  initialData?: any;
}

export function TransactionForm({
  type,
  buttonLabel,
  categories,
  onSuccess,
  initialData,
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);

  const initialFormState = useMemo(
    (): TransactionModel => ({
      name: "",
      description: "",
      amount: "",
      transactionDate: "",
      category: categories[0]?.value || "outros",
      recurring: false,
      type: type,
    }),
    [type, categories],
  );

  const [formData, setFormData] = useState<TransactionModel>(initialFormState);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.title || initialData.name,
        description: initialData.description || "",
        amount: initialData.amount.toString(),
        transactionDate: initialData.date.split("T")[0],
        category: initialData.category,
        recurring: initialData.isRecurring || false,
        type: type,
      });

      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, type, initialFormState]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amountNumber = Number(formData.amount);
    const errors = [];

    if (!formData.name) errors.push("Nome inválido");
    if (!formData.amount || isNaN(amountNumber) || amountNumber < 0)
      errors.push("Valor inválido");
    if (!formData.transactionDate) errors.push("Data inválida");

    if (errors.length > 0) {
      toast.dismiss();
      errors.forEach((error) => toast.error(error));
      return;
    }

    setLoading(true);

    try {
      const safeDate = new Date(`${formData.transactionDate}T12:00:00`);

      const payload = {
        title: formData.name,
        amount: amountNumber,
        description:
          formData.description.trim() === "" ? null : formData.description,
        date: safeDate.toISOString(),
        category: formData.category,
        type: type.toUpperCase(),
        isRecurring: formData.recurring,
      };

      if (initialData?.id) {
        await api.patch(`/transactions/${initialData.id}`, payload);
        toast.success("Transação salva com sucesso!");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transação salva com sucesso!");
      }

      setFormData(initialFormState);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={formRef} className="scroll-mt-24">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 🧾 Dados principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="name"
              placeholder={
                type === "income"
                  ? "Ex: Salário Mensal"
                  : type === "expense"
                    ? "Ex: Aluguel"
                    : "Ex: Aporte em Investimento"
              }
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
                focus:border-[#42B7B2] focus:ring-[#42B7B2]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="0,00"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
                focus:border-[#42B7B2] focus:ring-[#42B7B2]"
            />
          </div>
        </div>

        {/* 📝 Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Informações adicionais sobre a transação..."
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
              focus:border-[#42B7B2] focus:ring-[#42B7B2]"
          />
        </div>

        {/* 📅 Meta dados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Data
            </label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
                focus:border-[#42B7B2] focus:ring-[#42B7B2]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Categoria
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm
                focus:border-[#42B7B2] focus:ring-[#42B7B2]"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="recurring"
              checked={formData.recurring}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-[#42B7B2] focus:ring-[#42B7B2]"
            />
            Transação recorrente
          </label>
        </div>

        {/* 🔘 Ações */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          {initialData && (
            <button
              type="button"
              onClick={onSuccess}
              className="flex-1 rounded-xl border border-red-300 bg-red-50 py-3 text-sm
                font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`flex-1 rounded-xl py-3 text-sm font-medium text-white transition cursor-pointer
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#42B7B2] hover:bg-teal-600"
              }`}
          >
            {loading
              ? "Salvando..."
              : initialData
                ? "Salvar Alterações"
                : buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
