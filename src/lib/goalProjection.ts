import type { Transaction } from "@/src/models/TransactionModel";

/**
 * Projeção de conclusão de uma meta.
 *
 * O percentual sozinho não responde a pergunta que importa — "nesse ritmo eu
 * chego a tempo?". Aqui saem três números: o ritmo atual, quando ele leva à
 * conclusão, e quanto seria preciso por mês para bater a data-alvo. O último é
 * o único acionável.
 */

/** Janela padrão para medir o ritmo. Meses recentes representam melhor o hábito atual. */
export const PACE_WINDOW_MONTHS = 6;

export type GoalStatus =
  | "completed"
  | "no-contributions"
  | "no-target-date"
  | "on-track"
  | "behind"
  | "overdue";

export type GoalProjection = {
  status: GoalStatus;
  remaining: number;
  /** Média mensal de aportes na janela considerada. */
  monthlyPace: number | null;
  /** Quantos meses a janela abrangeu — o número precisa ser interpretável. */
  paceWindowMonths: number;
  /** Meses até concluir mantendo o ritmo atual. */
  monthsToFinish: number | null;
  finishMonth: { month: number; year: number } | null;
  targetMonth: { month: number; year: number } | null;
  /** Positivo = conclui depois do alvo; negativo = antes. */
  monthsOffTarget: number | null;
  /** Aporte mensal necessário para bater a data-alvo. */
  requiredMonthly: number | null;
};

const monthIndex = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

const fromIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
});

export function projectGoal(
  goal: { targetValue: number | string; currentValue: number | string; targetDate?: string },
  contributions: Transaction[],
  now = new Date(),
): GoalProjection {
  const target = Number(goal.targetValue) || 0;
  const current = Number(goal.currentValue) || 0;
  const remaining = Math.max(target - current, 0);

  const nowIndex = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
  const targetIndex = targetDate && !Number.isNaN(targetDate.getTime()) ? monthIndex(targetDate) : null;
  const targetMonth = targetIndex === null ? null : fromIndex(targetIndex);

  const base = {
    remaining,
    paceWindowMonths: 0,
    monthlyPace: null,
    monthsToFinish: null,
    finishMonth: null,
    targetMonth,
    monthsOffTarget: null,
    requiredMonthly: null,
  };

  if (remaining <= 0) return { ...base, status: "completed" };

  // --- ritmo: média dos aportes na janela recente
  const months = contributions
    .map((item) => monthIndex(new Date(item.date)))
    .filter((index) => !Number.isNaN(index));

  if (months.length === 0) {
    // Sem aporte não há ritmo. Ainda assim dá para dizer o que seria preciso.
    const monthsToTarget = targetIndex === null ? null : Math.max(targetIndex - nowIndex, 0);

    return {
      ...base,
      status: targetIndex !== null && targetIndex < nowIndex ? "overdue" : "no-contributions",
      requiredMonthly: monthsToTarget ? remaining / monthsToTarget : null,
    };
  }

  // A janela nunca começa antes do primeiro aporte: dividir por 6 meses uma meta
  // criada há 2 subestimaria o ritmo pela metade.
  const firstIndex = Math.min(...months);
  const windowStart = Math.max(firstIndex, nowIndex - (PACE_WINDOW_MONTHS - 1));
  const paceWindowMonths = Math.max(nowIndex - windowStart + 1, 1);

  const contributedInWindow = contributions.reduce((total, item) => {
    const index = monthIndex(new Date(item.date));
    return index >= windowStart && index <= nowIndex ? total + Number(item.amount) : total;
  }, 0);

  const monthlyPace = contributedInWindow / paceWindowMonths;

  if (monthlyPace <= 0) {
    const monthsToTarget = targetIndex === null ? null : Math.max(targetIndex - nowIndex, 0);

    return {
      ...base,
      paceWindowMonths,
      monthlyPace: 0,
      status: targetIndex !== null && targetIndex < nowIndex ? "overdue" : "no-contributions",
      requiredMonthly: monthsToTarget ? remaining / monthsToTarget : null,
    };
  }

  const monthsToFinish = Math.ceil(remaining / monthlyPace);
  const finishMonth = fromIndex(nowIndex + monthsToFinish);

  if (targetIndex === null) {
    return {
      ...base,
      status: "no-target-date",
      paceWindowMonths,
      monthlyPace,
      monthsToFinish,
      finishMonth,
    };
  }

  const monthsToTarget = targetIndex - nowIndex;
  const monthsOffTarget = monthsToFinish - monthsToTarget;

  return {
    remaining,
    paceWindowMonths,
    monthlyPace,
    monthsToFinish,
    finishMonth,
    targetMonth,
    monthsOffTarget,
    // Alvo no passado: não há mais prazo para dividir, o valor restante é "agora".
    requiredMonthly: monthsToTarget > 0 ? remaining / monthsToTarget : remaining,
    status: monthsToTarget < 0 ? "overdue" : monthsOffTarget > 0 ? "behind" : "on-track",
  };
}

/** Agrupa aportes por meta, para projetar todas de uma vez. */
export function groupByGoal(transactions: Transaction[]): Map<string, Transaction[]> {
  const byGoal = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    if (!transaction.goalId) continue;

    const list = byGoal.get(transaction.goalId);
    if (list) list.push(transaction);
    else byGoal.set(transaction.goalId, [transaction]);
  }

  return byGoal;
}

/** Teto do cronograma, para uma meta muito longa não gerar centenas de linhas. */
export const MAX_SCHEDULE_MONTHS = 120;

export type ScheduleRow = {
  month: number;
  year: number;
  contribution: number;
  accumulated: number;
  /** Percentual da meta ao fim daquele mês, de 0 a 100. */
  percent: number;
};

export type Schedule = {
  rows: ScheduleRow[];
  monthly: number;
  /** True quando o cronograma foi cortado no teto — nunca cortar em silêncio. */
  truncated: boolean;
};

/**
 * Cronograma mês a mês até concluir a meta.
 *
 * `mode` decide o ritmo: "pace" mantém o que a pessoa vem aportando, "target"
 * usa o valor necessário para bater a data-alvo. O último aporte é ajustado
 * para fechar exatamente no objetivo, em vez de ultrapassá-lo.
 */
export function buildSchedule(
  projection: GoalProjection,
  goal: { targetValue: number | string; currentValue: number | string },
  mode: "pace" | "target",
  now = new Date(),
): Schedule | null {
  const monthly = mode === "pace" ? projection.monthlyPace : projection.requiredMonthly;

  if (!monthly || monthly <= 0 || projection.remaining <= 0) return null;

  const target = Number(goal.targetValue) || 0;
  let accumulated = Number(goal.currentValue) || 0;

  const startIndex = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;
  const rows: ScheduleRow[] = [];

  while (accumulated < target && rows.length < MAX_SCHEDULE_MONTHS) {
    // O último aporte fecha a conta certa: ninguém deposita mais do que falta.
    const contribution = Math.min(monthly, target - accumulated);
    accumulated += contribution;

    const index = startIndex + rows.length;
    rows.push({
      ...fromIndex(index),
      contribution,
      accumulated,
      percent: target > 0 ? (accumulated / target) * 100 : 0,
    });
  }

  return { rows, monthly, truncated: accumulated < target };
}
