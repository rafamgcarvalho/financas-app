"use client";

import { Container } from "@/src/components/Container/Index";
import { CreateGoalModal } from "@/src/components/CreateGoalModal/Index";
import { GoalCard } from "@/src/components/GoalCard/Index";
import { GoalDetailsModal } from "@/src/components/GoalDetailsModal/Index";
import { SpinLoader } from "@/src/components/SpinLoader/Index";
import { GoalModel } from "@/src/models/GoalModel";
import { api } from "@/src/services/api";
import { useCallback, useEffect, useState } from "react";

export default function InvestimentosPage() {
  const [goals, setGoals] = useState<GoalModel[]>([]);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalModel | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) {
        setLoading(true);
      }

      const response = await api.get("/goals");
      const newData = response.data || response;

      setGoals(newData);

      setSelectedGoal((prevSelected) => {
        if (!prevSelected) return null;
        const updatedGoal = newData.find(
          (g: GoalModel) => g.id === prevSelected.id
        );

        return updatedGoal || prevSelected;
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

  if (loading) {
    return (
      <Container>
        <SpinLoader className="min-h-[400px]" />
      </Container>
    );
  }

  return (
    <Container>
      {/* Card principal */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-linear-to-b from-white to-gray-50 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Metas Financeiras
            </h2>
            <p className="text-sm text-gray-500">
              Acompanhe o progresso das suas metas e investimentos
            </p>
          </div>

          <button
            onClick={() => setIsCreateGoalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl
                       bg-linear-to-r from-blue-600 to-blue-700
                       px-6 py-3 text-sm font-bold text-white
                       shadow-lg transition-all
                       hover:brightness-110 cursor-pointer"
          >
            + Nova meta
          </button>
        </div>

        {/* Conteúdo */}
        {goals.length > 0 ? (
          <div className="relative">
            {/* Fade lateral para indicar scroll */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-linear-to-l from-gray-50 to-transparent" />

            <div className="flex gap-6 overflow-x-auto pb-4 pr-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  name={goal.title}
                  totalValue={goal.targetValue}
                  investedValue={goal.currentValue}
                  status={goal.status}
                  onClick={() => setSelectedGoal(goal)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <p className="text-sm font-medium text-gray-500">
              Você ainda não possui nenhuma meta cadastrada
            </p>
          </div>
        )}
      </section>

      {/* Modais */}
      {isCreateGoalOpen && (
        <CreateGoalModal
          onClose={() => setIsCreateGoalOpen(false)}
          onSuccess={() => fetchGoals(true)}
        />
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
