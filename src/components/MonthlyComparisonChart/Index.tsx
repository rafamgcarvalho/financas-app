"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/src/services/api";
import { AXIS_STYLE, ChartCard, TOOLTIP_STYLE } from "../ChartCard/Index";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatCompactCurrency } from "@/src/lib/money";
import { TYPE_THEME } from "@/src/lib/transactionTheme";

type ComparisonEntry = {
  name: string;
  valor: number;
  fill?: string;
};

/** Cor por rótulo, caso a API não mande `fill`. */
function colorFor(name: string, fallback?: string): string {
  const key = name.toLowerCase();

  if (key.startsWith("receita")) return TYPE_THEME.income.hex;
  if (key.startsWith("despesa")) return TYPE_THEME.expense.hex;
  if (key.startsWith("invest")) return TYPE_THEME.investment.hex;

  return fallback ?? "#94a3b8";
}

export function MonthlyComparisonChart({ month, year }: { month: number; year: number }) {
  const [data, setData] = useState<ComparisonEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.get<ComparisonEntry[]>(
          `/transactions/stats/comparison?month=${month}&year=${year}`,
        );
        if (active) setData(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erro ao carregar comparativo", error);
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

  const isEmpty = data.every((entry) => !Number(entry.valor));

  return (
    <ChartCard
      title="Comparativo do mês"
      subtitle="Receitas x Despesas"
      loading={loading}
      empty={isEmpty}
      emptyMessage="Nenhum lançamento neste mês para comparar."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barCategoryGap={28}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e9edf3" />
          <XAxis dataKey="name" {...AXIS_STYLE} />
          <YAxis {...AXIS_STYLE} width={64} tickFormatter={(value: number) => formatCompactCurrency(value)} />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            {...TOOLTIP_STYLE}
            formatter={(value) => formatCurrency(Number(value) || 0)}
          />

          {/* Cell é o que o recharts usa para colorir barra a barra — antes havia
              um <rect> aqui, que ele ignora. */}
          <Bar dataKey="valor" barSize={44} radius={[10, 10, 4, 4]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={colorFor(entry.name, entry.fill)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
