/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { GoalModel } from "@/src/models/GoalModel";
import {
  Edit2,
  Trash2,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Info,
} from "lucide-react";
import { api } from "@/src/services/api";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../ConfirmDialog/Index";
import { CreateGoalModal } from "../CreateGoalModal/Index";
import { TransactionsList } from "../TransactionsList/Index";
import { CreateInvestmentModal } from "../CreateInvestmentModal/Index";

type GoalDetailsModalProps = {
  goal: GoalModel;
  onClose: () => void;
  onRefresh: () => void;
};

export function GoalDetailsModal({
  goal: initialGoal,
  onClose,
  onRefresh,
}: GoalDetailsModalProps) {
  const [view, setView] = useState<"DETAILS" | "EDIT" | "ADD_INVESTMENT">(
    "DETAILS",
  );

  const [currentGoal, setCurrentGoal] = useState<GoalModel>(initialGoal);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<any | null>();
  const [transactionsKey, setTransactionsKey] = useState(0);

  useEffect(() => {
    setCurrentGoal(initialGoal);
  }, [initialGoal]);

  if (!currentGoal) return null;

  const total = Number(currentGoal.targetValue);
  const invested = Number(currentGoal.currentValue);
  const progress = total > 0 ? Math.min((invested / total) * 100, 100) : 0;
  const remaining = Math.max(total - invested, 0);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Não definida";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const handleDelete = () => {
    setGoalToDelete(currentGoal);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    try {
      await api.delete(`/goals/${goalToDelete.id}`);
      toast.success("Meta excluída com sucesso");
      setIsConfirmDialogOpen(false);
      onClose();
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir meta.");
    }
  };

  const handleTransactionListRefresh = async () => {
    onRefresh?.();
    setTransactionsKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10
          w-full max-w-7xl
          max-h-[90vh]
          overflow-hidden
          rounded-3xl
          bg-white
          border border-gray-200/60
          shadow-[0_20px_60px_rgba(0,0,0,0.15)]
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-6 border-b bg-gray-50/70">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentGoal.title}
              </h2>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {currentGoal.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie sua meta e visualize seus aportes
            </p>
          </div>

          <div className="flex items-center gap-2">
            {view === "DETAILS" && (
              <>
                <button
                  onClick={() => setView("EDIT")}
                  className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-10">
          {view === "DETAILS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* COLUNA ESQUERDA */}
              <div className="lg:col-span-6 space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    <TrendingUp size={14} /> Desempenho
                  </h4>

                  <div className="bg-linear-to-br from-blue-50 to-white rounded-3xl p-8 border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <p className="text-4xl font-black text-blue-700">
                          {progress.toFixed(1)}%
                        </p>
                        <p className="text-sm text-blue-500 italic">
                          da meta alcançada
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">
                          Faltam
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="h-4 w-full bg-blue-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Objetivo Final
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Total Poupado
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(invested)}
                    </p>
                  </div>

                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Início
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {formatDate(currentGoal.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Data Alvo
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {formatDate(currentGoal.targetDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {currentGoal.description && (
                  <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <h5 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-2">
                      <Info size={14} /> Sobre esta meta
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentGoal.description}
                    </p>
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA */}
              <div className="lg:col-span-6 flex flex-col min-h-[420px]">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Aportes Realizados
                  </h4>
                  <button
                    onClick={() => setView("ADD_INVESTMENT")}
                    className="flex items-center gap-2 bg-gray-900 text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition shadow-md cursor-pointer"
                  >
                    <Plus size={14} /> ADICIONAR
                  </button>
                </div>

                <div className="
                  flex-1
                  bg-linear-to-b from-gray-50 to-white
                  border border-gray-200/70
                  rounded-3xl
                  p-5
                  overflow-hidden
                  shadow-inner
                ">
                  <TransactionsList
                    key={transactionsKey}
                    type="investment"
                    goalId={currentGoal.id}
                    variant="minimal"
                    onRefresh={handleTransactionListRefresh}
                    exibirAcoes={true}
                  />
                </div>
              </div>
            </div>
          )}

          {view === "ADD_INVESTMENT" && (
            <CreateInvestmentModal
              goalId={currentGoal.id}
              goalTitle={currentGoal.title}
              onClose={() => setView("DETAILS")}
              onSuccess={() => {
                setView("DETAILS");
                handleTransactionListRefresh();
                toast.success("Aporte adicionado!");
              }}
            />
          )}

          {view === "EDIT" && (
            <CreateGoalModal
              initialData={currentGoal}
              onClose={() => setView("DETAILS")}
              onSuccess={(dataFromModal) => {
                if (dataFromModal) setCurrentGoal(dataFromModal);
                onRefresh?.();
                setView("DETAILS");
              }}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        title="Confirmar exclusão"
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Tem certeza que deseja excluir esta meta?"
        isGroup={!!goalToDelete?.groupId}
      />
    </div>
  );
}
