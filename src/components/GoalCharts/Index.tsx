"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_STYLE, TOOLTIP_STYLE } from "../ChartCard/Index";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatCompactCurrency } from "@/src/lib/money";
import { TYPE_THEME } from "@/src/lib/transactionTheme";
import type { HistoryPoint, MonthlyBar } from "@/src/lib/goalHistory";

const PLANNED_COLOR = "#94a3b8";
const REAL_COLOR = TYPE_THEME.investment.hex;
// Indigo médio: distingue-se do teal (real) e do cinza (planejado) e continua
// legível — a versão anterior era clara demais para enxergar.
const PROJECTED_COLOR = "#818cf8";

/**
 * Evolução da meta: o acumulado real contra a trajetória que o prazo exige,
 * com a projeção continuando a linha para o futuro.
 *
 * É o gráfico que responde "estou acima ou abaixo do necessário, e desde
 * quando?" — algo que o percentual sozinho nunca disse.
 */
export function GoalEvolutionChart({
  points,
  target,
}: {
  points: HistoryPoint[];
  target: number;
}) {
  if (points.length < 2) {
    return (
      <p className="flex h-full items-center justify-center text-center text-xs text-slate-400">
        A evolução aparece depois do segundo mês de aportes.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={points} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="goalReal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={REAL_COLOR} stopOpacity={0.28} />
            <stop offset="95%" stopColor={REAL_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e9edf3" />
        <XAxis dataKey="label" {...AXIS_STYLE} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...AXIS_STYLE} width={64} tickFormatter={(v: number) => formatCompactCurrency(v)} />

        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(value, name) => [formatCurrency(Number(value) || 0), String(name)]}
        />
        <Legend verticalAlign="top" align="right" iconType="plainline" iconSize={14}
          wrapperStyle={{ fontSize: 11, color: AXIS_STYLE.tick.fill, paddingBottom: 8 }} />

        {/* A meta como teto: dá a referência de quão longe ainda está. */}
        <ReferenceLine
          y={target}
          stroke={PLANNED_COLOR}
          strokeDasharray="6 4"
          label={{ value: "meta", position: "insideTopRight", fontSize: 10, fill: PLANNED_COLOR }}
        />

        <Line
          name="Planejado"
          type="monotone"
          dataKey="planned"
          stroke={PLANNED_COLOR}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          connectNulls
        />

        <Line
          name="Projeção"
          type="monotone"
          dataKey="projected"
          stroke={PROJECTED_COLOR}
          strokeWidth={2.5}
          strokeDasharray="2 4"
          dot={false}
          connectNulls
        />

        <Area
          name="Acumulado"
          type="monotone"
          dataKey="real"
          stroke={REAL_COLOR}
          strokeWidth={3}
          fill="url(#goalReal)"
          dot={false}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/**
 * Aporte por mês.
 *
 * Constância é o que decide uma meta, e é justamente o que nenhum total
 * mostra: as barras revelam de imediato se os aportes são regulares ou em
 * rajadas, e os meses vazios saltam à vista.
 */
export function GoalMonthlyChart({ bars, average }: { bars: MonthlyBar[]; average: number }) {
  if (bars.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-center text-xs text-slate-400">
        Nenhum aporte ainda.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={bars} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e9edf3" />
        <XAxis dataKey="label" {...AXIS_STYLE} interval="preserveStartEnd" minTickGap={16} />
        <YAxis {...AXIS_STYLE} width={64} tickFormatter={(v: number) => formatCompactCurrency(v)} />

        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          {...TOOLTIP_STYLE}
          formatter={(value) => [formatCurrency(Number(value) || 0), "Aporte"]}
        />

        {average > 0 && (
          <ReferenceLine
            y={average}
            stroke={PLANNED_COLOR}
            strokeDasharray="5 5"
            label={{ value: "média", position: "insideTopRight", fontSize: 10, fill: PLANNED_COLOR }}
          />
        )}

        <Bar dataKey="amount" fill={REAL_COLOR} radius={[6, 6, 2, 2]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}
