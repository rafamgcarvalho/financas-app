"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/src/services/api";
import { AXIS_STYLE, ChartCard, TOOLTIP_STYLE } from "../ChartCard/Index";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatCompactCurrency } from "@/src/lib/money";
import { TYPE_THEME } from "@/src/lib/transactionTheme";

type ChartData = {
  label: string;
  income: number;
  expense: number;
};

export function FinancialChart({ refreshToken }: { refreshToken?: number }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchStats() {
      try {
        setLoading(true);
        const response = await api.get<ChartData[]>("/transactions/stats");
        if (active) setData(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      active = false;
    };
  }, [refreshToken]);

  /** Média de despesa do período — dá uma régua para ler os picos. */
  const averageExpense = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((acc, entry) => acc + Number(entry.expense || 0), 0) / data.length;
  }, [data]);

  return (
    <ChartCard
      title="Evolução mensal"
      subtitle="Receitas x Despesas ao longo do tempo"
      loading={loading}
      empty={data.length === 0}
      emptyMessage="Ainda não há histórico suficiente para montar a evolução."
      action={
        averageExpense > 0 ? (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            Despesa média {formatCurrency(averageExpense)}
          </span>
        ) : null
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={TYPE_THEME.income.hex} stopOpacity={0.3} />
              <stop offset="95%" stopColor={TYPE_THEME.income.hex} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={TYPE_THEME.expense.hex} stopOpacity={0.3} />
              <stop offset="95%" stopColor={TYPE_THEME.expense.hex} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e9edf3" />
          <XAxis dataKey="label" {...AXIS_STYLE} dy={8} />
          <YAxis {...AXIS_STYLE} width={64} tickFormatter={(value: number) => formatCompactCurrency(value)} />

          <Tooltip
            cursor={{ stroke: "#e9edf3", strokeDasharray: "4 4" }}
            {...TOOLTIP_STYLE}
            formatter={(value) => formatCurrency(Number(value) || 0)}
          />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={9}
            wrapperStyle={{ fontSize: 11, color: AXIS_STYLE.tick.fill, paddingBottom: 10 }}
          />

          {averageExpense > 0 && (
            <ReferenceLine y={averageExpense} stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={1.5} />
          )}

          <Area
            name="Receitas"
            type="monotone"
            dataKey="income"
            stroke={TYPE_THEME.income.hex}
            strokeWidth={2.5}
            fill="url(#colorIncome)"
            activeDot={{ r: 4 }}
          />

          <Area
            name="Despesas"
            type="monotone"
            dataKey="expense"
            stroke={TYPE_THEME.expense.hex}
            strokeWidth={2.5}
            fill="url(#colorExpense)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
