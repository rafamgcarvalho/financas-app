/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
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
  const [view, setView] = useState<"DETAILS" | "EDIT" | "ADD_INVESTMENT">("DETAILS");
  const [currentGoal, setCurrentGoal] = useState<GoalModel>(initialGoal);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<any | null>();

  const skipNextSync = useRef(false);

  const goalHash = JSON.stringify(initialGoal);

  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    setCurrentGoal(initialGoal);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalHash]); 

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
      const url = `/goals/${goalToDelete.id}`;
      await api.delete(url);

      toast.success("Meta excluída com sucesso");
      setIsConfirmDialogOpen(false);
      if (onRefresh) {
        onRefresh();
      }
      onClose();
    } catch (err) {
      console.error("Erro ao tentar excluir meta", err);
      toast.error("Erro ao excluir meta.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentGoal.title}
              </h2>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
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
                  className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  title="Editar meta"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title="Excluir meta"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-all text-2xl cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo Variável */}
        <div className="flex-1 overflow-y-auto p-8">
          {view === "DETAILS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">
                    <TrendingUp size={14} /> Desempenho
                  </h4>
                  <div className="bg-linear-to-br from-blue-50 to-white rounded-3xl p-8 border border-blue-100 shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-4xl font-black text-blue-700">
                          {progress.toFixed(1)}%
                        </p>
                        <p className="text-sm font-medium text-blue-500/80 italic">
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
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full shadow-lg"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Objetivo Final
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(total)}
                    </p>
                  </div>
                  <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
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
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {currentGoal.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col h-full min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">
                    Aportes Realizados
                  </h4>
                  <button
                    onClick={() => setView("ADD_INVESTMENT")}
                    className="flex items-center gap-2 bg-gray-900 text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-all shadow-md cursor-pointer"
                  >
                    <Plus size={14} /> ADICIONAR
                  </button>
                </div>

                <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-2 flex-1 flex flex-col overflow-hidden">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-separate border-spacing-y-2 px-2">
                      <thead>
                        <tr className="text-[10px] uppercase text-gray-400">
                          <th className="px-4 py-2 font-bold">Data</th>
                          <th className="px-4 py-2 font-bold text-right">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <td className="px-4 py-3 text-xs font-medium text-gray-600 rounded-l-xl border-y border-l border-gray-50">
                            --/--/----
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right rounded-r-xl border-y border-r border-gray-50">
                            R$ 0,00
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                        <TrendingUp size={24} />
                      </div>
                      <p className="text-gray-400 text-xs italic px-10">
                        Nenhum investimento registrado. <br /> Comece a poupar
                        para atingir seu objetivo!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "ADD_INVESTMENT" && (
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Plus size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Novo Aporte em {currentGoal.title}
              </h3>
              <p className="text-gray-500">
                O valor será somado ao saldo atual da meta.
              </p>
              <div className="flex flex-col gap-3 pt-6">
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all cursor-pointer">
                  Confirmar Investimento
                </button>
                <button
                  onClick={() => setView("DETAILS")}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                >
                  Cancelar e voltar
                </button>
              </div>
            </div>
          )}

          {view === "EDIT" && (
            <CreateGoalModal
              initialData={currentGoal}
              onClose={() => setView("DETAILS")}
              onSuccess={async (dataFromModal) => {
                try {
                  skipNextSync.current = true;

                  if (dataFromModal) {
                    setCurrentGoal(dataFromModal);
                  }

                  if (onRefresh) {
                    onRefresh();
                  }

                  setView("DETAILS");
                } catch (error) {
                  console.error("Erro ao processar sucesso da edição", error);
                  setView("DETAILS");
                }
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