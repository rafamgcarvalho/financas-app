/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "@/src/services/api";

export function CategoryPieChart({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(
          `/transactions/stats/categories?month=${month}&year=${year}`,
        );
        setData(response);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [month, year]);

  return (
    <div className="w-full h-[420px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gastos por Categoria
        </h3>
        <p className="text-sm text-gray-500">
          Distribuição dos gastos no período
        </p>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={78}
              outerRadius={110}
              paddingAngle={4}
              strokeWidth={0}
            >
              {data.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)",
                padding: "10px 12px",
              }}
              labelStyle={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 4,
              }}
              itemStyle={{
                fontSize: 12,
                color: "#111827",
              }}
              formatter={(value: any) =>
                `R$ ${Number(value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                fontSize: "12px",
                color: "#374151",
                paddingTop: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
