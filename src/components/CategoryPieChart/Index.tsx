"use client";

import { useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "@/src/services/api";
import { AXIS_STYLE, ChartCard, TOOLTIP_STYLE } from "../ChartCard/Index";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { findCategory } from "@/src/lib/categories";

type CategoryEntry = {
  name: string;
  value: number;
  fill?: string;
  /** Alguns endpoints devolvem a chave da categoria em vez do rótulo. */
  category?: string;
};

export function CategoryPieChart({ month, year }: { month: number; year: number }) {
  const [data, setData] = useState<CategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.get<CategoryEntry[]>(
          `/transactions/stats/categories?month=${month}&year=${year}`,
        );
        if (active) setData(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao carregar gastos por categoria", error);
        if (active) setData([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [month, year]);

  // Usa o rótulo e a cor do cadastro de categorias, caindo para o que a API
  // mandou quando o valor não é uma categoria conhecida.
  const chartData = useMemo(
    () =>
      data
        .filter((entry) => Number(entry.value) > 0)
        .map((entry) => {
          const known = findCategory(entry.category ?? entry.name);
          const isKnown = known.value === (entry.category ?? entry.name);

          return {
            name: isKnown ? known.label : entry.name,
            value: Number(entry.value),
            fill: entry.fill ?? known.color,
          };
        })
        .sort((a, b) => b.value - a.value),
    [data],
  );

  const total = chartData.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <ChartCard
      title="Gastos por categoria"
      subtitle="Distribuição das despesas no período"
      loading={loading}
      empty={chartData.length === 0}
      emptyMessage="Nenhuma despesa categorizada neste mês."
    >
      <div className="relative h-full">
        {/* Total no centro da rosca — o número que se procura primeiro. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-12">
          <span className="text-[11px] uppercase tracking-wide text-slate-400">Total</span>
          <span className="text-lg font-bold text-navy-800">{formatCurrency(total)}</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={3} strokeWidth={0}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>

            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value, name) => [
                `${formatCurrency(Number(value) || 0)} (${total ? Math.round(((Number(value) || 0) / total) * 100) : 0}%)`,
                String(name),
              ]}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={9}
              wrapperStyle={{ fontSize: 11, color: AXIS_STYLE.tick.fill, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
