"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Info, Pause, Pencil, Play, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Container } from "@/src/components/Container/Index";
import { SpinLoader } from "@/src/components/SpinLoader/Index";
import { ConfirmDialog } from "@/src/components/ConfirmDialog/Index";
import { CreateGoalModal } from "@/src/components/CreateGoalModal/Index";
import { CreateInvestmentModal } from "@/src/components/CreateInvestmentModal/Index";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { GoalProjection } from "@/src/components/GoalProjection/Index";
import { GoalMembers } from "@/src/components/GoalMembers/Index";
import { GoalEvolutionChart, GoalMonthlyChart } from "@/src/components/GoalCharts/Index";
import { ChartCard } from "@/src/components/ChartCard/Index";
import { api } from "@/src/services/api";
import { useGoalSocket, type GoalUpdatedPayload } from "@/src/hooks/useGoalSocket";
import { projectGoal } from "@/src/lib/goalProjection";
import { consistencyStats, goalHistory, monthlyContributions } from "@/src/lib/goalHistory";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatMonthLabel } from "@/src/lib/dates";
import type { GoalModel } from "@/src/models/GoalModel";
import type { Transaction } from "@/src/models/TransactionModel";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-invest-50 text-invest-700 ring-invest-100",
  PAUSED: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-income-50 text-income-700 ring-income-100",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  COMPLETED: "Concluída",
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-navy-800">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function GoalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [goal, setGoal] = useState<GoalModel | null>(null);
  const [contributions, setContributions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [investmentTarget, setInvestmentTarget] = useState<Transaction | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const [goalData, contributionData] = await Promise.all([
        api.get<GoalModel>(`/goals/${id}`),
        api.get<Transaction[]>(`/transactions?goalId=${id}`).catch(() => [] as Transaction[]),
      ]);

      if (!goalData?.id) {
        setNotFound(true);
        return;
      }

      setGoal(goalData);
      setContributions(Array.isArray(contributionData) ? contributionData : []);
    } catch (error) {
      console.error("Erro ao carregar meta", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Aporte de outro participante atualiza a página sem recarregar.
  const handleGoalUpdated = useCallback(
    (payload: GoalUpdatedPayload) => {
      if (payload.goalId !== id) return;

      setRefreshKey((prev) => prev + 1);
      toast.info(
        `${payload.userName} ${payload.action === "created" ? "aportou" : "alterou um aporte de"} ${formatCurrency(Number(payload.amount))}`,
      );
    },
    [id],
  );

  useGoalSocket({ onGoalUpdated: handleGoalUpdated });

  const projection = useMemo(
    () => (goal ? projectGoal(goal, contributions) : null),
    [goal, contributions],
  );

  const bars = useMemo(() => monthlyContributions(contributions), [contributions]);
  const stats = useMemo(() => consistencyStats(bars), [bars]);

  const history = useMemo(
    () => (goal && projection ? goalHistory(goal, contributions, projection) : []),
    [goal, contributions, projection],
  );

  const toggleStatus = async () => {
    if (!goal) return;

    // PAUSED existia no banco e no rótulo, mas nenhuma tela chegava nele.
    const next = goal.status === "PAUSED" ? "ACTIVE" : "PAUSED";

    try {
      await api.patch(`/goals/${goal.id}`, { status: next });
      toast.success(next === "PAUSED" ? "Meta pausada" : "Meta retomada");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar o status");
    }
  };

  const handleDelete = async () => {
    if (!goal) return;

    try {
      await api.delete(`/goals/${goal.id}`);
      toast.success("Meta excluída");
      router.push("/investimentos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir meta");
    } finally {
      setConfirmDelete(false);
    }
  };

  if (loading) return <SpinLoader className="min-h-[60vh]" />;

  if (notFound || !goal || !projection) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Target size={28} className="text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Meta não encontrada</p>
          <Link
            href="/investimentos"
            className="rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-navy-800"
          >
            Voltar para as metas
          </Link>
        </div>
      </Container>
    );
  }

  const target = Number(goal.targetValue) || 0;
  const invested = Number(goal.currentValue) || 0;
  const progress = target > 0 ? Math.min((invested / target) * 100, 100) : 0;
  const remaining = Math.max(target - invested, 0);
  const isOwner = goal.isOwner !== false;
  const members = goal.members ?? [];
  const isOverdue = projection.status === "overdue";

  const badge = isOverdue ? "bg-expense-50 text-expense-700 ring-expense-100" : STATUS_BADGE[goal.status];
  const label = isOverdue ? "Atrasada" : STATUS_LABEL[goal.status];

  return (
    <Container>
      <Link
        href="/investimentos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-navy-800"
      >
        <ArrowLeft size={16} />
        Metas
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-800 sm:text-3xl">{goal.title}</h1>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ring-1 ${badge}`}
            >
              {label}
            </span>
          </div>

          {goal.description && (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
              {goal.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInvestmentTarget("new")}
            className="flex items-center gap-2 rounded-xl bg-invest-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-invest-600 cursor-pointer"
          >
            <Plus size={16} />
            Aportar
          </button>

          {isOwner && (
            <>
              <button
                onClick={toggleStatus}
                title={goal.status === "PAUSED" ? "Retomar meta" : "Pausar meta"}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                {goal.status === "PAUSED" ? <Play size={15} /> : <Pause size={15} />}
                {goal.status === "PAUSED" ? "Retomar" : "Pausar"}
              </button>

              <button
                onClick={() => setIsEditing(true)}
                aria-label="Editar meta"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 cursor-pointer"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => setConfirmDelete(true)}
                aria-label="Excluir meta"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 transition hover:bg-expense-50 hover:text-expense-600 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Onde estou */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Investido</p>
            <p className="text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              {formatCurrency(invested)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              de {formatCurrency(target)}
              {remaining > 0 && ` · faltam ${formatCurrency(remaining)}`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-invest-600">{progress.toFixed(1)}%</p>
            {goal.targetDate && (
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400">
                <CalendarClock size={13} />
                alvo em{" "}
                {formatMonthLabel(
                  new Date(goal.targetDate).getUTCMonth() + 1,
                  new Date(goal.targetDate).getUTCFullYear(),
                ).toLowerCase()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              goal.status === "COMPLETED" ? "bg-income-500" : isOverdue ? "bg-expense-500" : "bg-brand-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Aporte médio" value={formatCurrency(stats.average)} hint={`${stats.months} meses`} />
        <Stat
          label="Maior aporte"
          value={stats.best ? formatCurrency(stats.best.amount) : "—"}
          hint={stats.best?.label}
        />
        <Stat
          label="Meses sem aportar"
          value={String(stats.missed)}
          hint={stats.missed === 0 ? "constância perfeita" : "no período"}
        />
        <Stat
          label="Sequência atual"
          value={`${stats.streak} ${stats.streak === 1 ? "mês" : "meses"}`}
          hint="seguidos com aporte"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Evolução" subtitle="Acumulado real, trajetória planejada e projeção">
            <GoalEvolutionChart points={history} target={target} />
          </ChartCard>
        </div>

        <GoalProjection projection={projection} goal={goal} variant="full" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Constância" subtitle="Quanto foi aportado em cada mês">
            <GoalMonthlyChart bars={bars} average={stats.average} />
          </ChartCard>
        </div>

        <GoalMembers
          goalId={goal.id}
          members={members}
          contributions={contributions}
          isOwner={isOwner}
          onChanged={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>

      <div className="mt-6">
        <TransactionsList
          type="investment"
          goalId={goal.id}
          refreshToken={refreshKey}
          toolbar
          exportable
          title="Aportes desta meta"
          onEdit={(transaction) => setInvestmentTarget(transaction)}
          onCreate={() => setInvestmentTarget("new")}
          onRefresh={() => setRefreshKey((prev) => prev + 1)}
        />
      </div>

      {isEditing && (
        <CreateGoalModal
          initialData={goal}
          onClose={() => setIsEditing(false)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      )}

      {investmentTarget !== null && (
        <CreateInvestmentModal
          goalId={goal.id}
          goalTitle={goal.title}
          initialData={investmentTarget === "new" ? undefined : investmentTarget}
          onClose={() => setInvestmentTarget(null)}
          onSuccess={() => {
            setInvestmentTarget(null);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Excluir meta"
        message={`"${goal.title}" e todos os ${contributions.length} aportes vinculados serão removidos. Esta ação não pode ser desfeita.`}
      />
    </Container>
  );
}
