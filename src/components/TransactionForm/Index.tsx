/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TransactionForm/Index.tsx
"use client";

import { TransactionModel } from "@/src/models/IncomeModel";
import { api } from "@/src/services/api";
import { useState } from "react";
import { toast } from "react-toastify";

interface TransactionFormProps {
  type: "income" | "expense" | "investment";
  buttonLabel: string;
  categories: { value: string; label: string }[];
  onSuccess: () => void;
}

export function TransactionForm({type, buttonLabel, categories, onSuccess}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);

  const initialFormState: TransactionModel = {
      name: "",
      description: "",
      amount: "",
      transactionDate: "",
      category: categories[0]?.value || "outros",
      recurring: false,
      type: type,
  };

  const [formData, setFormData] = useState<TransactionModel>(initialFormState);

  const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
  
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
  
      setFormData((prevData) => ({
        ...prevData,
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
        const payload = {
          title: formData.name,
          amount: amountNumber,
          description:
            formData.description.trim() === "" ? null : formData.description,
          date: new Date(formData.transactionDate).toISOString(),
          category: formData.category,
          type: type.toUpperCase(),
          isRecurring: formData.recurring,
        };
  
        await api.post("/transactions", payload);
  
        toast.success("Receita salva com sucesso!");
  
        setFormData(initialFormState);

        onSuccess();
  
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ex: Salário Mensal"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
            />
          </div>

          <div>
            <label
              htmlFor="valor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Valor (R$)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="0.00"
              step="0.01"
              required
              value={formData.amount}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Detalhes sobre a origem da receita..."
            value={formData.description}
            onChange={handleChange}
            className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label
              htmlFor="data"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data
            </label>
            <input
              type="date"
              id="transactionDate"
              name="transactionDate"
              required
              value={formData.transactionDate}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="recurring"
              name="recurring"
              type="checkbox"
              checked={formData.recurring}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-[#42B7B2] border-gray-300 rounded focus:ring-[#42B7B2]"
            />
            <label
              htmlFor="recurring"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              É Recorrente (Mensal)
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42B7B2] 
                        ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#42B7B2] hover:bg-teal-600 hover:cursor-pointer"
                        }`}
          >
            {loading ? "Salvando..." : buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
