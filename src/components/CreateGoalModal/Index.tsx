/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CreateGoalForm } from "@/src/models/GoalModel";
import { useState } from "react";
import { toast } from "react-toastify";
import { Container } from "../Container/Index";
import { SpinLoader } from "../SpinLoader/Index";
import { api } from "@/src/services/api";

type CreateGoalModalProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

export function CreateGoalModal({ onClose, onSuccess }: CreateGoalModalProps) {
  const [loading, setLoading] = useState(false);

  const initialFormState: CreateGoalForm = {
    title: "",
    description: "",
    targetValue: "" as any,
    startDate: "",
    targetDate: "",
    type: "" as any,
    priority: "" as any,
    status: "ACTIVE",
  };

  const [formData, setFormData] = useState<CreateGoalForm>(initialFormState);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetAmount = Number(formData.targetValue);
    const errors = [];

    if (!formData.title) errors.push("Título inválido");
    if (!formData.targetValue) errors.push("Valor inválido");
    if (!formData.type) errors.push("Tipo inválido");
    if (!formData.startDate) errors.push("Data inválida");
    if (!formData.priority) errors.push("Prioridade inválida");

    if (errors.length) {
      toast.dismiss();
      errors.forEach((err) => toast.error(err));
      return;
    }

    setLoading(true);

    try {
      const safeStartDate = new Date(`${formData.startDate}T12:00:00`);
      const safeTargetDate = formData.targetDate 
        ? new Date(`${formData.targetDate}T12:00:00`).toISOString() 
        : undefined;

      const payload = {
        title: formData.title,
        description: formData.description,
        targetValue: targetAmount,
        startDate: safeStartDate.toISOString(),
        targetDate: safeTargetDate,
        type: formData.type,
        priority: formData.priority,
        status: "ACTIVE",
      }

      await api.post("/goals", payload);

      setFormData(initialFormState);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao tentar criar meta", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Criar nova meta
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nome da meta
            </label>
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

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Descrição (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes sobre essa meta"
              rows={2}
              className="rounded-lg border border-gray-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Valor e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Valor total
              </label>
              <input
                type="number"
                name="targetValue"
                required
                value={formData.targetValue}
                onChange={handleChange}
                placeholder="0,00"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Tipo da meta
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Selecione
                </option>
                <option value="SHORT">Curto prazo</option>
                <option value="MEDIUM">Médio prazo</option>
                <option value="LONG">Longo prazo</option>
              </select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Início
              </label>
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
              <label className="text-sm font-medium text-gray-700">
                Data alvo
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Campo de Prioridade */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Prioridade
            </label>
            <select
              name="priority"
              required
              value={formData.priority}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Selecione a urgência
              </option>
              <option value="DESIRABLE">Baixa</option>
              <option value="IMPORTANT">Média</option>
              <option value="ESSENTIAL">Essencial / Alta</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer"
          >
            Criar meta
          </button>
        </div>
      </form>
    </div>
  );
}
