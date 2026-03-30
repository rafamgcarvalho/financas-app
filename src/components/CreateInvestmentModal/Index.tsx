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
  initialData?: any;
}

export function CreateInvestmentModal({
  goalId,
  goalTitle,
  onClose,
  onSuccess,
  initialData,
}: CreateInvestmentModalProps) {
  const isEdit = Boolean(initialData?.id);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: initialData?.title || `Aporte: ${goalTitle}`,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        type: "INVESTMENT",
        category: "investimento",
        description: description || "",
        isRecurring: false,
        installments: 1,
        goalId: goalId,
      };

      if (isEdit) {
        await api.patch(`/transactions/${initialData.id}`, payload);
        toast.success("Aporte atualizado com sucesso!");
      } else {
        await api.post("/transactions", payload);
        toast.success("Aporte adicionado com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Erro detalhado:", error?.message || error);
      toast.error("Erro ao validar dados. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Ajustado max-w e adicionado max-h para telas pequenas */}
      <div className="
        relative w-full max-w-md 
        max-h-[95vh] flex flex-col
        overflow-hidden rounded-3xl 
        bg-white 
        shadow-2xl
        border border-gray-200/70
        animate-in fade-in zoom-in-95 duration-200
      ">
        
        {/* Header - Padding reduzido levemente */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 text-white rounded-lg">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {isEdit ? 'Editar Aporte' : 'Novo Aporte'}
              </h3>
              <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest opacity-90">
                {goalTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Valor */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    R$
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all font-bold text-gray-900 text-base"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider">
                  Data
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 transition-all text-gray-700 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-wider">
                Observação <span className="text-gray-300 font-normal normal-case">(Opcional)</span>
              </label>
              <div className="relative">
                <TextQuote
                  className="absolute left-3 top-3 text-gray-400"
                  size={16}
                />
                <textarea
                  placeholder="Ex: Reserva de emergência"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 resize-none text-sm text-gray-700"
                />
              </div>
            </div>

            {/* Categoria Fixa */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50/80 rounded-xl border border-blue-100/50">
              <Tag size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Categoria: Investimento
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer text-sm"
              >
                {loading ? "Processando..." : isEdit ? "Salvar Alterações" : "Confirmar Aporte"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 py-2 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}