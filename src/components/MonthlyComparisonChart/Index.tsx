// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { api } from "@/src/services/api";

// interface Props {
//   month: number;
//   year: number;
// }

// export function MonthlyComparisonChart({ month, year }: Props) {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const response = await api.get(
//           `/transactions/stats/comparison?month=${month}&year=${year}`,
//         );
//         setData(response);
//       } catch (error) {
//         console.error("Erro ao carregar comparativo", error);
//       }
//     }
//     fetchData();
//   }, [month, year]);

//   return (
//     <div className="w-full h-[400px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
//       <h3 className="text-lg font-semibold text-gray-800 mb-6">
//         Comparativo do Mês
//       </h3>
//       <div className="flex-1 w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data} margin={{ left: -20 }}>
//             <CartesianGrid
//               strokeDasharray="3 3"
//               vertical={false}
//               stroke="#f0f0f0"
//             />
//             <XAxis
//               dataKey="name"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: "#9CA3AF", fontSize: 12 }}
//             />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: "#9CA3AF", fontSize: 12 }}
//             />
//             <Tooltip
//               cursor={{ fill: "#f8fafc" }}
//               contentStyle={{
//                 borderRadius: "12px",
//                 border: "none",
//                 boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
//               }}
//               // Usamos any para evitar o conflito com o tipo interno do Recharts que espera undefined
//               formatter={(value: any) => {
//                 if (value === undefined || value === null) return "R$ 0,00";

//                 return `R$ ${Number(value).toLocaleString("pt-BR", {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 })}`;
//               }}
//             />
//             {/* <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={50} /> */}
//             <Bar
//               dataKey="valor"
//               radius={[6, 6, 0, 0]}
//               barSize={50}
//               fill="#8884d8"
//             >
//               {data.map((entry: any, index: number) => (
//                 <rect key={`bar-${index}`} fill={entry.fill} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }







/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/src/services/api";

interface Props {
  month: number;
  year: number;
}

export function MonthlyComparisonChart({ month, year }: Props) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(
          `/transactions/stats/comparison?month=${month}&year=${year}`,
        );
        setData(response);
      } catch (error) {
        console.error("Erro ao carregar comparativo", error);
      }
    }
    fetchData();
  }, [month, year]);

  return (
    <div className="w-full h-[420px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Comparativo do Mês
        </h3>
        <p className="text-sm text-gray-500">
          Receitas x Despesas
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barCategoryGap={24}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />

            <Tooltip
              cursor={{ fill: "#F9FAFB" }}
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
              formatter={(value: any) => {
                if (value === undefined || value === null) return "R$ 0,00";

                return `R$ ${Number(value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              }}
            />

            <Bar
              dataKey="valor"
              barSize={44}
              radius={[10, 10, 4, 4]}
            >
              {data.map((entry: any, index: number) => (
                <rect
                  key={`bar-${index}`}
                  fill={entry.fill}
                  rx={10}
                  ry={10}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
