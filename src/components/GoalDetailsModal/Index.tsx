/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { GoalModel, GoalMember } from "@/src/models/GoalModel";
import { useGoalSocket, GoalUpdatedPayload } from "@/src/hooks/useGoalSocket";
import {
  Edit2,
  Trash2,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Info,
  Users,
  UserPlus,
  X,
  Crown,
  UserMinus,
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
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  // Estado para adicionar membro
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberUsername, setMemberUsername] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Estado para remover membro
  const [memberToRemove, setMemberToRemove] = useState<GoalMember | null>(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  useEffect(() => {
    setCurrentGoal(initialGoal);
  }, [initialGoal]);

  // WebSocket — tempo real
  const handleGoalUpdated = useCallback(
    (payload: GoalUpdatedPayload) => {
      if (payload.goalId !== currentGoal.id) return;

      // Atualiza o valor atual da meta (barra de progresso cresce em tempo real)
      setCurrentGoal((prev) => ({
        ...prev,
        currentValue: Number(payload.currentValue),
      }));

      // Recarrega a lista de aportes
      setTransactionsKey((prev) => prev + 1);

      // Toast informando quem fez o aporte
      const actionText =
        payload.action === "created"
          ? "fez um aporte"
          : payload.action === "updated"
            ? "editou um aporte"
            : "removeu um aporte";

      const formattedAmount = Number(payload.amount).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      toast.info(`💰 ${payload.userName} ${actionText} de ${formattedAmount}`);
    },
    [currentGoal.id],
  );

  useGoalSocket({ onGoalUpdated: handleGoalUpdated });

  if (!currentGoal) return null;

  const total = Number(currentGoal.targetValue);
  const invested = Number(currentGoal.currentValue);
  const progress = total > 0 ? Math.min((invested / total) * 100, 100) : 0;
  const remaining = Math.max(total - invested, 0);

  const isCompleted = currentGoal.status === "COMPLETED";
  const isOwner = currentGoal.isOwner !== false; // default true para retrocompatibilidade
  const members = currentGoal.members || [];
  const isShared = members.length > 1;

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

  const handleEditInvestment = (transaction: any) => {
    setEditingTransaction(transaction);
    setView("ADD_INVESTMENT");
  };

  const handleCloseInvestmentModal = () => {
    setEditingTransaction(null);
    setView("DETAILS");
  };

  /* ========== MEMBROS ========== */

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberUsername.trim()) return;

    setAddingMember(true);
    try {
      await api.post(`/goals/${currentGoal.id}/members`, {
        username: memberUsername.trim().toLowerCase(),
      });
      toast.success("Participante adicionado com sucesso!");
      setMemberUsername("");
      setIsAddMemberOpen(false);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao adicionar participante");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = (member: GoalMember) => {
    setMemberToRemove(member);
    setIsRemoveConfirmOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await api.delete(
        `/goals/${currentGoal.id}/members/${memberToRemove.id}`
      );
      toast.success("Participante removido com sucesso!");
      setIsRemoveConfirmOpen(false);
      setMemberToRemove(null);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao remover participante");
    }
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
              ? "bg-linear-to-r from-green-50 to-white"
              : "bg-linear-to-r from-blue-50 to-white"
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

              {isShared && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                  <Users size={12} />
                  Meta compartilhada
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {isShared
                ? "Meta compartilhada — todos os participantes podem aportar"
                : "Gerencie sua meta e visualize seus aportes"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {view === "DETAILS" && isOwner && (
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
                        ? "bg-linear-to-br from-green-50 to-white border-green-200"
                        : "bg-linear-to-br from-blue-50 to-white border-blue-200"
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

                {/* SEÇÃO DE PARTICIPANTES */}
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <Users size={14} /> Participantes
                    </h5>
                    {isOwner && (
                      <button
                        onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-600 hover:text-purple-700 transition cursor-pointer bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full"
                      >
                        <UserPlus size={12} />
                        Adicionar
                      </button>
                    )}
                  </div>

                  {/* Form para adicionar membro */}
                  {isAddMemberOpen && isOwner && (
                    <form
                      onSubmit={handleAddMember}
                      className="mb-4 flex gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={memberUsername}
                          onChange={(e) => setMemberUsername(e.target.value)}
                          placeholder="Digite o username..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingMember || !memberUsername.trim()}
                        className="px-4 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition cursor-pointer shadow-sm"
                      >
                        {addingMember ? "..." : "Adicionar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddMemberOpen(false);
                          setMemberUsername("");
                        }}
                        className="p-2.5 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  )}

                  {/* Lista de membros */}
                  <div className="space-y-2">
                    {members.length > 0 ? (
                      members.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                              {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                {member.name}
                                {member.role === "OWNER" && (
                                  <Crown
                                    size={12}
                                    className="text-amber-500"
                                    fill="currentColor"
                                  />
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                @{member.username}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                member.role === "OWNER"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {member.role === "OWNER"
                                ? "Dono"
                                : "Membro"}
                            </span>

                            {isOwner && member.role !== "OWNER" && (
                              <button
                                onClick={() => handleRemoveMember(member)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Remover participante"
                              >
                                <UserMinus size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-3">
                        Apenas você nesta meta
                      </p>
                    )}
                  </div>
                </div>
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

                <div className="flex-1 rounded-3xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-5 shadow-inner overflow-hidden">
                  <TransactionsList
                    key={transactionsKey}
                    type="investment"
                    goalId={currentGoal.id}
                    variant="minimal"
                    onRefresh={handleTransactionListRefresh}
                    onEdit={handleEditInvestment}
                    exibirAcoes={true}
                  />
                </div>
              </div>
            </div>
          )}

          {(view === "ADD_INVESTMENT" || editingTransaction) && (
            <CreateInvestmentModal
              goalId={currentGoal.id}
              goalTitle={currentGoal.title}
              initialData={editingTransaction || undefined}
              onClose={handleCloseInvestmentModal}
              onSuccess={() => {
                handleCloseInvestmentModal();
                handleTransactionListRefresh();
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

      <ConfirmDialog
        title="Remover participante"
        isOpen={isRemoveConfirmOpen}
        onClose={() => {
          setIsRemoveConfirmOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        message={`Tem certeza que deseja remover ${memberToRemove?.name || "este participante"} desta meta?`}
        isGroup={false}
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
