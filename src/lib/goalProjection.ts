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
  /**
   * Quanto a projeção assume por mês: o plano declarado, se houver; senão a
   * mediana dos aportes recentes.
   */
  monthlyPace: number | null;
  /** De onde saiu o número acima. */
  paceSource: "plan" | "observed";
  /** Ritmo efetivamente observado, para aferir se o plano vem sendo cumprido. */
  observedPace: number | null;
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

/** Mediana de uma série — resistente a um mês fora da curva. */
function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;

  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const monthIndex = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

const fromIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
});

export function projectGoal(
  goal: {
    targetValue: number | string;
    currentValue: number | string;
    targetDate?: string;
    /** Aporte mensal pretendido. Tem precedência sobre o histórico. */
    monthlyPlan?: number | string | null;
  },
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

  const plan = Number(goal.monthlyPlan) || null;

  const base = {
    remaining,
    paceWindowMonths: 0,
    monthlyPace: plan,
    paceSource: (plan ? "plan" : "observed") as "plan" | "observed",
    observedPace: null,
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

  // Sem histórico e sem plano não há o que projetar.
  if (months.length === 0 && !plan) {
    const monthsToTarget = targetIndex === null ? null : Math.max(targetIndex - nowIndex, 0);

    return {
      ...base,
      status: targetIndex !== null && targetIndex < nowIndex ? "overdue" : "no-contributions",
      requiredMonthly: monthsToTarget ? remaining / monthsToTarget : null,
    };
  }

  // A janela nunca começa antes do primeiro aporte: dividir por 6 meses uma meta
  // criada há 2 subestimaria o ritmo pela metade. Sem aportes, a janela é o mês
  // corrente — só o plano sustenta a projeção.
  const firstIndex = months.length > 0 ? Math.min(...months) : nowIndex;
  const windowStart = Math.max(firstIndex, nowIndex - (PACE_WINDOW_MONTHS - 1));
  const paceWindowMonths = Math.max(nowIndex - windowStart + 1, 1);

  // Mediana, não média: um 13º de R$ 5.000 entre aportes de R$ 900 puxava a
  // média para R$ 1.583 e a meta parecia 10 meses mais perto do que está.
  // Meses sem aporte entram como zero — pular mês é ritmo mais lento, de fato.
  const perMonth = new Array<number>(paceWindowMonths).fill(0);

  for (const item of contributions) {
    const index = monthIndex(new Date(item.date));
    if (index >= windowStart && index <= nowIndex) {
      perMonth[index - windowStart] += Number(item.amount);
    }
  }

  const observedPace = median(perMonth);
  // O plano declarado manda: é ele que torna a projeção estável.
  const monthlyPace = plan ?? observedPace;
  const paceSource: "plan" | "observed" = plan ? "plan" : "observed";

  if (monthlyPace <= 0) {
    const monthsToTarget = targetIndex === null ? null : Math.max(targetIndex - nowIndex, 0);

    return {
      ...base,
      paceWindowMonths,
      observedPace,
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
      paceSource,
      observedPace,
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
    paceSource,
    observedPace,
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

export type ScenarioKey = "target" | "plan" | "observed";

export type Scenario = {
  key: ScenarioKey;
  label: string;
  monthly: number;
  monthsToFinish: number;
  finishMonth: { month: number; year: number };
  /** Positivo = conclui depois do alvo. Null quando a meta não tem data-alvo. */
  monthsOffTarget: number | null;
};

/**
 * Os caminhos possíveis até a meta, para comparar lado a lado.
 *
 * São três leituras diferentes da mesma meta: o que o prazo exige, o que a
 * pessoa se propôs a fazer, e o que ela vem fazendo de fato. Ver os três juntos
 * é o que mostra o tamanho da diferença entre intenção e prática.
 */
export function buildScenarios(
  projection: GoalProjection,
  goal: { targetValue: number | string; currentValue: number | string; monthlyPlan?: number | string | null },
  now = new Date(),
): Scenario[] {
  if (projection.remaining <= 0) return [];

  const nowIndex = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const targetIndex =
    projection.targetMonth === null
      ? null
      : projection.targetMonth.year * 12 + (projection.targetMonth.month - 1);

  const describe = (key: ScenarioKey, label: string, monthly: number | null): Scenario | null => {
    if (!monthly || monthly <= 0) return null;

    const monthsToFinish = Math.ceil(projection.remaining / monthly);

    return {
      key,
      label,
      monthly,
      monthsToFinish,
      finishMonth: fromIndex(nowIndex + monthsToFinish),
      monthsOffTarget: targetIndex === null ? null : monthsToFinish - (targetIndex - nowIndex),
    };
  };

  const plan = Number(goal.monthlyPlan) || null;

  const scenarios = [
    describe("target", "Para bater o alvo", projection.requiredMonthly),
    describe("plan", "No plano", plan),
    // Sem plano declarado, o ritmo observado já é a projeção principal — não
    // faz sentido repeti-lo como se fosse um cenário alternativo.
    plan ? describe("observed", "No ritmo atual", projection.observedPace) : null,
  ];

  return scenarios.filter((scenario): scenario is Scenario => scenario !== null);
}

/**
 * Cronograma mês a mês até concluir a meta, com um aporte mensal fixo.
 *
 * O último aporte é ajustado para fechar exatamente no objetivo, em vez de
 * ultrapassá-lo.
 */
export function buildSchedule(
  goal: { targetValue: number | string; currentValue: number | string },
  monthly: number,
  now = new Date(),
): Schedule | null {
  const target = Number(goal.targetValue) || 0;
  let accumulated = Number(goal.currentValue) || 0;

  if (!monthly || monthly <= 0 || accumulated >= target) return null;

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
