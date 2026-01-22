/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  const formRef = useRef<HTMLDivElement>(null);

  const placeholders = {
    name:
      type === "income"
        ? "Ex: Salário"
        : type === "expense"
        ? "Ex: Aluguel"
        : "Ex: Investimento",
    description:
      type === "income"
        ? "Origem da receita (opcional)"
        : "Detalhes da despesa (opcional)",
  };

  const initialFormState = useMemo(
    () => ({
      name: "",
      description: "",
      amount: "",
      transactionDate: "",
      category: categories[0]?.value || "outros",
      recurring: false,
      installments: "1",
      type,
    }),
    [type, categories],
  );

  const [formData, setFormData] = useState<any>(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.title || initialData.name,
        description: initialData.description || "",
        amount: initialData.amount.toString(),
        transactionDate: initialData.date.split("T")[0],
        category: initialData.category,
        recurring: initialData.isRecurring || false,
        installments: initialData.installments?.toString() || "1",
        type,
      });

      formRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, initialFormState, type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      recurring: checked,
      installments: checked ? "1" : prev.installments,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amountNumber = Number(formData.amount);
    const installmentsNumber = Number(formData.installments);
    const errors = [];

    if (!formData.name) errors.push("Nome inválido");
    if (!formData.amount || isNaN(amountNumber) || amountNumber < 0)
      errors.push("Valor inválido");
    if (!formData.transactionDate) errors.push("Data inválida");
    if (!formData.recurring && installmentsNumber < 1)
      errors.push("Número de parcelas inválido");

    if (errors.length) {
      toast.dismiss();
      errors.forEach((err) => toast.error(err));
      return;
    }

    setLoading(true);

    try {
      const safeDate = new Date(`${formData.transactionDate}T12:00:00`);

      const payload = {
        title: formData.name,
        amount: amountNumber,
        description: formData.description || null,
        date: safeDate.toISOString(),
        category: formData.category,
        type: type.toUpperCase(),
        isRecurring: formData.recurring,
        installments: formData.recurring ? 1 : installmentsNumber,
      };

      if (initialData?.id) {
        await api.patch(`/transactions/${initialData.id}`, payload);
        toast.success("Transação atualizada!");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transação(ões) criada(s) com sucesso!");
      }

      setFormData(initialFormState);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={formRef} className="scroll-mt-24">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Nome e Valor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nome
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={placeholders.name}
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0,00"
              className="w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Descrição
          </label>
          <textarea
            rows={2}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={placeholders.description}
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        {/* Data, Categoria, Recorrência */}
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
              className="w-full rounded-xl border px-4 py-3 text-sm"
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
              className="w-full rounded-xl border px-4 py-3 text-sm cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recorrente + Parcelas */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={handleCheckboxChange}
                className="h-4 w-4 cursor-pointer"
              />
              Recorrente (mensal)
            </label>

            <div
              className={`transition ${
                formData.recurring ? "opacity-40" : "opacity-100"
              }`}
            >
              <label className="block text-xs text-gray-500 mb-1">
                Nº de parcelas
              </label>
              <input
                type="number"
                min="1"
                max="48"
                name="installments"
                value={formData.installments}
                onChange={handleChange}
                disabled={formData.recurring}
                className="w-24 rounded-lg border px-2 py-1 text-sm disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          {initialData && (
            <button
              type="button"
              onClick={onSuccess}
              className="flex-1 rounded-xl border py-3 text-sm cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl py-3 text-sm text-white cursor-pointer bg-[#42B7B2] disabled:opacity-60"
          >
            {loading ? "Salvando..." : buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
