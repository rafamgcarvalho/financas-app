/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useTransactionForm.ts
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/src/services/api";
import { TransactionModel } from "@/src/models/IncomeModel";

export function useTransactionForm(type: "income" | "expense" | "investment", onSuccess: () => void) {
  const initialFormState: TransactionModel = {
    name: "",
    description: "",
    amount: "",
    transactionDate: "",
    category: "outros",
    recurring: false,
    type: type,
  };

  const [formData, setFormData] = useState<TransactionModel>(initialFormState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = Number(formData.amount);

    if (!formData.name || amountNumber <= 0 || !formData.transactionDate) {
      toast.error("Preencha os campos obrigatórios corretamente.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions", {
        title: formData.name,
        amount: amountNumber,
        description: formData.description.trim() || null,
        date: new Date(formData.transactionDate).toISOString(),
        category: formData.category,
        type: type,
        isRecurring: formData.recurring,
      });

      toast.success("Salvo com sucesso!");
      setFormData(initialFormState);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  console.log("Dados: ", formData)

  return { formData, loading, handleChange, handleSubmit };
}