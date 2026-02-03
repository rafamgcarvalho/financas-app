/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { X, DollarSign, Calendar, TextQuote, Tag } from "lucide-react";
import { api } from "@/src/services/api";
import { toast } from "react-toastify";

interface CreateInvestmentModalProps {
  goalId: string;
  goalTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateInvestmentModal({
  goalId,
  goalTitle,
  onClose,
  onSuccess,
}: CreateInvestmentModalProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: `Aporte: ${goalTitle}`,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        type: "INVESTMENT",
        category: "investimento",
        description: description || "",
        isRecurring: false,
        installments: 1,
        goalId: goalId,
      };

      await api.post("/transactions", payload);

      toast.success("Aporte realizado com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Erro detalhado:", error.message);
      toast.error("Erro ao validar dados. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-linear-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] border border-gray-200/70">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-linear-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 text-white rounded-xl">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Novo Aporte
              </h3>
              <p className="text-[11px] text-blue-100 uppercase font-bold tracking-widest">
                {goalTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          {/* Valor */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">
              Valor do Aporte
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                R$
              </span>
              <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all font-extrabold text-gray-900 text-lg"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">
              Data
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 transition-all text-gray-700"
              />
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">
              Observação
            </label>
            <div className="relative">
              <TextQuote
                className="absolute left-4 top-4 text-gray-400"
                size={18}
              />
              <textarea
                placeholder="Ex: Reserva de emergência"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/30 resize-none text-sm text-gray-700"
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-2xl border border-blue-100">
            <Tag size={14} className="text-blue-500" />
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Categoria automática: Investimento
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? "Processando..." : "Confirmar Aporte"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-sm font-bold text-gray-400 hover:text-gray-600 py-2 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
