/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CreateGoalForm, GoalModel } from "@/src/models/GoalModel";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Container } from "../Container/Index";
import { SpinLoader } from "../SpinLoader/Index";
import { api } from "@/src/services/api";

type CreateGoalModalProps = {
  onClose: () => void;
  onSuccess?: (updatedGoal?: GoalModel) => void;
  initialData?: GoalModel;
};

export function CreateGoalModal({ onClose, onSuccess, initialData }: CreateGoalModalProps) {
  const [loading, setLoading] = useState(false);

  const initialFormState: CreateGoalForm = {
    title: "",
    description: "",
    targetValue: "" as any,
    startDate: "",
    targetDate: "",
    type: "" as any,
    priority: "" as any,
    status: "ACTIVE" as "ACTIVE" | "PAUSED" | "COMPLETED",
  };

  const [formData, setFormData] = useState<CreateGoalForm>(initialFormState);

  const formatDateForInput = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        targetValue: initialData.targetValue as any,
        startDate: formatDateForInput(initialData.startDate),
        targetDate: initialData.targetDate ? formatDateForInput(initialData.targetDate) : "",
        type: initialData.type,
        priority: initialData.priority,
        status: initialData.status,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validações básicas
    const errors = [];
    if (!formData.title) errors.push("Título inválido");
    if (!formData.targetValue) errors.push("Valor inválido");
    if (!formData.startDate) errors.push("Data de início inválida");
    if (!formData.priority) errors.push("Prioridade inválida");

    if (errors.length) {
      toast.dismiss();
      errors.forEach((err) => toast.error(err));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        targetValue: Number(formData.targetValue),
        startDate: new Date(`${formData.startDate}T12:00:00`).toISOString(),
        targetDate: formData.targetDate
          ? new Date(`${formData.targetDate}T12:00:00`).toISOString()
          : null,
      };

      let response;

      if (initialData?.id) {
        response = await api.patch(`/goals/${initialData.id}`, payload);
        toast.success("Meta atualizada com sucesso!");
      } else {
        response = await api.post("/goals", payload);
        toast.success("Meta criada com sucesso!");
      }
      
      if (onSuccess) {
        const optimisticData = {
            ...initialData,
            ...payload,
            ...(response.data || {})
        };
        await onSuccess(optimisticData as GoalModel);
      }

      onClose();

    } catch (err) {
      console.error("Erro ao salvar meta", err);
      toast.error("Ocorreu um erro ao salvar a meta.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <SpinLoader className="min-h-[400px]" />
      </Container>
    );
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Editar meta" : "Criar nova meta"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome da meta</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Viagem, Reserva de emergência..."
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes sobre essa meta"
              rows={2}
              className="rounded-lg border border-gray-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Valor total</label>
              <input
                type="number"
                name="targetValue"
                required
                step="0.01"
                value={formData.targetValue}
                onChange={handleChange}
                placeholder="0,00"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo da meta</label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Selecione</option>
                <option value="SHORT">Curto prazo</option>
                <option value="MEDIUM">Médio prazo</option>
                <option value="LONG">Longo prazo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Início</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Data alvo</label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Prioridade</label>
            <select
              name="priority"
              required
              value={formData.priority}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Selecione a urgência</option>
              <option value="DESIRABLE">Baixa</option>
              <option value="IMPORTANT">Média</option>
              <option value="ESSENTIAL">Essencial / Alta</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-100"
          >
            {initialData ? "Salvar alterações" : "Criar meta"}
          </button>
        </div>
      </form>
    </div>
  );
}
