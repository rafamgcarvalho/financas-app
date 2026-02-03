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
    "DETAILS"
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

  const isCompleted = currentGoal.status === "COMPLETED";

  const statusMap = {
    ACTIVE: { label: "Ativa", color: "blue" },
    PAUSED: { label: "Pausada", color: "yellow" },
    COMPLETED: { label: "Concluída", color: "green" },
  };

  const status = statusMap[currentGoal.status];

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
      toast.error("Erro ao excluir meta.");
    }
  };

  const handleTransactionListRefresh = async () => {
    onRefresh?.();
    setTransactionsKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl bg-white border border-gray-200/70 shadow-[0_30px_80px_rgba(0,0,0,0.2)] flex flex-col">
        {/* HEADER */}
        <div
          className={`px-10 py-6 border-b flex items-center justify-between
          ${
            isCompleted
              ? "bg-gradient-to-r from-green-50 to-white"
              : "bg-gradient-to-r from-blue-50 to-white"
          }`}
        >
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {currentGoal.title}
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase
                ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {status.label}
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
                  className="p-3 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 rounded-xl hover:bg-red-50 text-red-500 transition cursor-pointer"
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

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-10">
          {view === "DETAILS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* ESQUERDA */}
              <div className="lg:col-span-6 space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">
                    <TrendingUp size={14} /> Progresso
                  </h4>

                  <div
                    className={`rounded-3xl p-8 border shadow-sm
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-50 to-white border-green-200"
                        : "bg-gradient-to-br from-blue-50 to-white border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <p
                          className={`text-4xl font-black ${
                            isCompleted
                              ? "text-green-700"
                              : "text-blue-700"
                          }`}
                        >
                          {progress.toFixed(1)}%
                        </p>
                        <p className="text-sm italic text-gray-500">
                          da meta alcançada
                        </p>
                      </div>

                      {!isCompleted && (
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-400 uppercase">
                            Faltam
                          </p>
                          <p className="text-xl font-bold text-gray-800">
                            {formatCurrency(remaining)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000
                        ${
                          isCompleted
                            ? "bg-green-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard label="Objetivo Final" value={formatCurrency(total)} />
                  <InfoCard
                    label="Total Poupado"
                    value={formatCurrency(invested)}
                    highlight
                  />
                  <DateCard
                    icon={<Calendar size={18} />}
                    label="Início"
                    value={formatDate(currentGoal.startDate)}
                  />
                  <DateCard
                    icon={<Target size={18} />}
                    label="Data Alvo"
                    value={formatDate(currentGoal.targetDate)}
                  />
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

              {/* DIREITA */}
              <div className="lg:col-span-6 flex flex-col min-h-[420px]">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Aportes
                  </h4>
                  <button
                    onClick={() => setView("ADD_INVESTMENT")}
                    className="flex items-center gap-2 bg-gray-900 text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition shadow-md cursor-pointer"
                  >
                    <Plus size={14} /> ADICIONAR
                  </button>
                </div>

                <div className="flex-1 rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 shadow-inner overflow-hidden">
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

/* Componentes visuais auxiliares (só UI) */
function InfoCard({ label, value, highlight = false }: any) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <p
        className={`text-lg font-bold ${
          highlight ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DateCard({ icon, label, value }: any) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-bold text-gray-700">{value}</p>
      </div>
    </div>
  );
}
