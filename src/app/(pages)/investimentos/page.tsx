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

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get("/goals");
      setGoals(data);
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
      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        {/* Header da seção */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Metas</h2>
            <p className="text-sm text-gray-500">
              Acompanhe o progresso das suas metas financeiras
            </p>
          </div>

          <button
            onClick={() => setIsCreateGoalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                       bg-blue-600 text-white font-medium
                       hover:bg-blue-700 transition cursor-pointer"
          >
            + Nova meta
          </button>
        </div>

        {/* Lista de metas */}
        {goals.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
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
        ) : (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <p className="mb-4">
              Você ainda não possui nenhuma meta cadastrada
            </p>
          </div>
        )}
      </div>

      {isCreateGoalOpen && (
        <CreateGoalModal
          onClose={() => setIsCreateGoalOpen(false)}
          onSuccess={fetchGoals}
        />
      )}

      {selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onRefresh={fetchGoals}
        />
      )}
    </Container>
  );
}
