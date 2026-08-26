"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { Container } from "@/src/components/Container/Index";
import { CreateGoalModal } from "@/src/components/CreateGoalModal/Index";
import { GoalCard } from "@/src/components/GoalCard/Index";
import { GoalDetailsModal } from "@/src/components/GoalDetailsModal/Index";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { OutOfPeriodNotice } from "@/src/components/OutOfPeriodNotice/Index";
import {
  PeriodSelector,
  periodsBetween,
  presetRange,
  type Period,
  type PeriodPreset,
} from "@/src/components/PeriodSelector/Index";
import { GoalModel } from "@/src/models/GoalModel";
import { api } from "@/src/services/api";
import { useGoalSocket, GoalUpdatedPayload } from "@/src/hooks/useGoalSocket";
import { useTransactions } from "@/src/contexts/TransactionsProvider";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { groupByGoal, projectGoal, type GoalProjection } from "@/src/lib/goalProjection";
import type { Transaction } from "@/src/models/TransactionModel";

function GoalsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-[248px] animate-shimmer rounded-2xl bg-slate-200/70" />
      ))}
    </div>
  );
}

export default function InvestimentosPage() {
  const { openTransaction, duplicateTransaction, refreshToken, notifyChange } = useTransactions();

  const [goals, setGoals] = useState<GoalModel[]>([]);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalModel | null>(null);
  const [loading, setLoading] = useState(true);
  // Histórico completo de aportes: o ritmo de cada meta é medido sobre ele,
  // não sobre o período que está sendo exibido na lista abaixo.
  const [contributions, setContributions] = useState<Transaction[]>([]);

  const [period, setPeriod] = useState<{ preset: PeriodPreset; from: Period; to: Period }>(() => ({
    preset: "6m",
    ...presetRange("6m"),
  }));

  const fetchGoals = useCallback(async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) setLoading(true);

      const response = await api.get<GoalModel[] | { data: GoalModel[] }>("/goals");
      const newData = Array.isArray(response) ? response : (response?.data ?? []);

      setGoals(newData);

      // Mantém o modal aberto em sincronia com os dados recarregados.
      setSelectedGoal((prev) => {
        if (!prev) return null;
        return newData.find((goal) => goal.id === prev.id) ?? prev;
      });
    } catch (error) {
      console.error("Erro ao carregar metas", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    api
      .get<Transaction[]>("/transactions?type=INVESTMENT")
      .then((data) => setContributions(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Erro ao carregar histórico de aportes", error));
  }, [refreshToken]);

  const projections = useMemo(() => {
    const byGoal = groupByGoal(contributions);
    const result = new Map<string, GoalProjection>();

    for (const goal of goals) {
      result.set(goal.id, projectGoal(goal, byGoal.get(goal.id) ?? []));
    }

    return result;
  }, [goals, contributions]);

  // Aporte lançado pelo modal global também mexe no progresso das metas.
  useEffect(() => {
    if (refreshToken > 0) fetchGoals(true);
  }, [refreshToken, fetchGoals]);

  const handleGoalUpdated = useCallback((payload: GoalUpdatedPayload) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === payload.goalId ? { ...goal, currentValue: Number(payload.currentValue) } : goal,
      ),
    );

    setSelectedGoal((prev) =>
      prev && prev.id === payload.goalId ? { ...prev, currentValue: Number(payload.currentValue) } : prev,
    );
  }, []);

  useGoalSocket({ onGoalUpdated: handleGoalUpdated });

  const months = useMemo(() => periodsBetween(period.from, period.to), [period]);

  const summary = useMemo(() => {
    const active = goals.filter((goal) => goal.status === "ACTIVE");

    return {
      invested: goals.reduce((acc, goal) => acc + Number(goal.currentValue || 0), 0),
      target: goals.reduce((acc, goal) => acc + Number(goal.targetValue || 0), 0),
      active: active.length,
      completed: goals.filter((goal) => goal.status === "COMPLETED").length,
      overdue: goals.filter((goal) => projections.get(goal.id)?.status === "overdue").length,
    };
  }, [goals, projections]);

  return (
    <Container>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 sm:text-3xl">Investimentos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe suas metas e o histórico de aportes
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Antes só era possível aportar de dentro de uma meta, embora o tipo
              "investimento" contasse no saldo do dashboard. */}
          <button
            onClick={() => openTransaction({ type: "investment" })}
            className="flex items-center gap-2 rounded-xl bg-invest-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-invest-600 cursor-pointer"
          >
            <Plus size={16} />
            Novo aporte
          </button>

          <button
            onClick={() => setIsCreateGoalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-navy-800 shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            <Target size={16} />
            Nova meta
          </button>
        </div>
      </div>

      <OutOfPeriodNotice
        months={months}
        onGoToMonth={(month, year) =>
          setPeriod({ preset: "custom", from: { month, year }, to: { month, year } })
        }
      />

      <section className="mb-6">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <h2 className="text-lg font-semibold text-navy-800">Metas financeiras</h2>
          {goals.length > 0 && (
            <p className="text-xs text-slate-500">
              <strong className="text-invest-600">{formatCurrency(summary.invested)}</strong> de{" "}
              {formatCurrency(summary.target)} · {summary.active} ativas · {summary.completed} concluídas
              {summary.overdue > 0 && (
                <strong className="text-expense-600">
                  {" · "}
                  {summary.overdue} atrasada{summary.overdue > 1 ? "s" : ""}
                </strong>
              )}
            </p>
          )}
        </div>

        {loading ? (
          <GoalsSkeleton />
        ) : goals.length > 0 ? (
          // Grade em vez do carrossel horizontal: no desktop dava para ver só
          // duas metas de cada vez, sobrando espaço à direita.
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                name={goal.title}
                totalValue={goal.targetValue}
                investedValue={goal.currentValue}
                status={goal.status}
                members={goal.members}
                targetDate={goal.targetDate}
                projection={projections.get(goal.id)}
                onClick={() => setSelectedGoal(goal)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Target size={22} />
            </div>
            <p className="text-sm font-medium text-slate-600">Nenhuma meta cadastrada</p>
            <p className="max-w-xs text-xs text-slate-400">
              Uma meta transforma o aporte solto em progresso visível.
            </p>
            <button
              onClick={() => setIsCreateGoalOpen(true)}
              className="mt-1 rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-navy-800 cursor-pointer"
            >
              Criar primeira meta
            </button>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-navy-800">Histórico de aportes</h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        <TransactionsList
          type="investment"
          months={months}
          refreshToken={refreshToken}
          toolbar
          exportable
          title="Aportes do período"
          onEdit={(transaction) => openTransaction({ transaction })}
          onDuplicate={duplicateTransaction}
          onCreate={() => openTransaction({ type: "investment" })}
          onRefresh={notifyChange}
        />
      </section>

      {isCreateGoalOpen && (
        <CreateGoalModal onClose={() => setIsCreateGoalOpen(false)} onSuccess={() => fetchGoals(true)} />
      )}

      {selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onRefresh={() => fetchGoals(true)}
        />
      )}
    </Container>
  );
}
