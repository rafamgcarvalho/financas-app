import type { Transaction } from "@/src/models/TransactionModel";
import { buildSchedule, type GoalProjection } from "./goalProjection";

/**
 * Série histórica de uma meta.
 *
 * O número final ("R$ 8.500 de R$ 28.000") diz onde você está, mas não conta a
 * história. O acumulado mês a mês, comparado à trajetória que a meta exigiria,
 * mostra desde quando o plano começou a descolar — e é isso que dá para corrigir.
 */

export type HistoryPoint = {
  month: number;
  year: number;
  label: string;
  /** Acumulado real ao fim do mês. Ausente nos meses futuros. */
  real?: number;
  /** Trajetória linear do início até a data-alvo. */
  planned?: number;
  /** Continuação do acumulado no ritmo projetado. */
  projected?: number;
};

export type MonthlyBar = {
  month: number;
  year: number;
  label: string;
  amount: number;
};

const monthIndex = (date: Date) => date.getUTCFullYear() * 12 + date.getUTCMonth();

const fromIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
});

/** "ago/26" — curto o bastante para caber no eixo sem girar o texto. */
function shortLabel(index: number): string {
  const { year, month } = fromIndex(index);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
    new Date(year, month - 1, 15),
  );

  return `${label.replace(".", "")}/${String(year).slice(2)}`;
}

/** Quanto foi aportado em cada mês, do primeiro aporte até agora. */
export function monthlyContributions(
  contributions: Transaction[],
  now = new Date(),
): MonthlyBar[] {
  if (contributions.length === 0) return [];

  const byMonth = new Map<number, number>();

  for (const item of contributions) {
    const index = monthIndex(new Date(item.date));
    if (Number.isNaN(index)) continue;
    byMonth.set(index, (byMonth.get(index) ?? 0) + Number(item.amount));
  }

  const first = Math.min(...byMonth.keys());
  const last = Math.max(now.getUTCFullYear() * 12 + now.getUTCMonth(), ...byMonth.keys());

  const bars: MonthlyBar[] = [];
  for (let index = first; index <= last; index++) {
    // Meses sem aporte entram como zero — o vão é a informação.
    bars.push({ ...fromIndex(index), label: shortLabel(index), amount: byMonth.get(index) ?? 0 });
  }

  return bars;
}

/**
 * Acumulado real, trajetória planejada e projeção, na mesma escala de tempo.
 */
export function goalHistory(
  goal: {
    targetValue: number | string;
    currentValue: number | string;
    startDate?: string;
    targetDate?: string;
  },
  contributions: Transaction[],
  projection: GoalProjection,
  now = new Date(),
): HistoryPoint[] {
  const target = Number(goal.targetValue) || 0;
  const nowIndex = now.getUTCFullYear() * 12 + now.getUTCMonth();

  const byMonth = new Map<number, number>();
  for (const item of contributions) {
    const index = monthIndex(new Date(item.date));
    if (!Number.isNaN(index)) byMonth.set(index, (byMonth.get(index) ?? 0) + Number(item.amount));
  }

  const startDate = goal.startDate ? new Date(goal.startDate) : null;
  const startIndex =
    startDate && !Number.isNaN(startDate.getTime())
      ? monthIndex(startDate)
      : byMonth.size > 0
        ? Math.min(...byMonth.keys())
        : nowIndex;

  const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
  const targetIndex =
    targetDate && !Number.isNaN(targetDate.getTime()) ? monthIndex(targetDate) : null;

  // A projeção estende a linha real até a conclusão, para o gráfico mostrar
  // onde o ritmo atual leva — e não parar no presente.
  const schedule = buildSchedule(goal, projection.monthlyPace ?? 0, now);
  const projectedEnd = schedule?.rows.length ? nowIndex + schedule.rows.length : nowIndex;

  const lastIndex = Math.max(nowIndex, targetIndex ?? nowIndex, projectedEnd);

  const points: HistoryPoint[] = [];
  let accumulated = 0;

  for (let index = startIndex; index <= lastIndex; index++) {
    const point: HistoryPoint = { ...fromIndex(index), label: shortLabel(index) };

    if (index <= nowIndex) {
      accumulated += byMonth.get(index) ?? 0;
      point.real = Number(accumulated.toFixed(2));
    }

    // Trajetória planejada: linha reta do início até a data-alvo.
    if (targetIndex !== null && targetIndex > startIndex && index <= targetIndex) {
      const progress = (index - startIndex) / (targetIndex - startIndex);
      point.planned = Number((target * progress).toFixed(2));
    }

    if (index >= nowIndex && schedule) {
      const step = index - nowIndex;
      const row = schedule.rows[step - 1];
      point.projected =
        step === 0 ? Number(accumulated.toFixed(2)) : row ? Number(row.accumulated.toFixed(2)) : undefined;
    }

    points.push(point);
  }

  return points;
}

/** Métricas de constância — o que decide se a meta sai do papel. */
export function consistencyStats(bars: MonthlyBar[]) {
  if (bars.length === 0) {
    return { average: 0, best: null, missed: 0, streak: 0, months: 0 };
  }

  const total = bars.reduce((sum, bar) => sum + bar.amount, 0);
  const best = bars.reduce((max, bar) => (bar.amount > (max?.amount ?? 0) ? bar : max), bars[0]);
  const missed = bars.filter((bar) => bar.amount === 0).length;

  // Sequência atual de meses seguidos com aporte, contando de trás para frente.
  let streak = 0;
  for (let i = bars.length - 1; i >= 0; i--) {
    if (bars[i].amount === 0) break;
    streak++;
  }

  return {
    average: total / bars.length,
    best: best.amount > 0 ? best : null,
    missed,
    streak,
    months: bars.length,
  };
}
