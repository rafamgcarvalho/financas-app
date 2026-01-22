// "use client";

// import { useEffect, useState } from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";
// import { api } from "@/src/services/api";

// interface ChartData {
//   label: string;
//   income: number;
//   expense: number;
// }

// export function FinancialChart() {
//   const [data, setData] = useState<ChartData[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         const response = await api.get("/transactions/stats");
//         console.log("Resposta completa da API:", response);
//         if (response) {
//           setData(response);
//         }
//       } catch (error) {
//         console.error("Erro ao carregar estatísticas", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStats();
//   }, []);

//   if (loading)
//     return (
//       <div className="h-[350px] w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
//         Carregando gráfico...
//       </div>
//     );

//   return (
//     <div className="w-full h-[400px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
//       <h3 className="text-lg font-semibold text-gray-800 mb-2">
//         Evolução Mensal
//       </h3>
      
//       {/* 🔹 Container de altura fixa que permite ao ResponsiveContainer respirar */}
//       <div className="flex-1 w-full min-h-[300px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//             <defs>
//               <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#42B7B2" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#42B7B2" stopOpacity={0} />
//               </linearGradient>
//               <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
//                 <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid
//               strokeDasharray="3 3"
//               vertical={false}
//               stroke="#f0f0f0"
//             />
//             <XAxis
//               dataKey="label"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: "#9CA3AF", fontSize: 12 }}
//               dy={10}
//             />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{ fill: "#9CA3AF", fontSize: 12 }}
//             />
//             <Tooltip
//               contentStyle={{
//                 borderRadius: "12px",
//                 border: "none",
//                 boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
//               }}
//             />
//             <Legend
//               verticalAlign="top"
//               align="right"
//               iconType="circle"
//               wrapperStyle={{ paddingTop: "0px", paddingBottom: "20px" }}
//             />
//             <Area
//               name="Receitas"
//               type="monotone"
//               dataKey="income"
//               stroke="#42B7B2"
//               strokeWidth={3}
//               fillOpacity={1}
//               fill="url(#colorIncome)"
//             />
//             <Area
//               name="Despesas"
//               type="monotone"
//               dataKey="expense"
//               stroke="#EF4444"
//               strokeWidth={3}
//               fillOpacity={1}
//               fill="url(#colorExpense)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }








"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "@/src/services/api";

interface ChartData {
  label: string;
  income: number;
  expense: number;
}

export function FinancialChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/transactions/stats");
        console.log("Resposta completa da API:", response);
        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="h-[350px] w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-sm text-gray-400">
        Carregando gráfico...
      </div>
    );

  return (
    <div className="w-full h-[420px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Evolução Mensal
        </h3>
        <span className="text-sm text-gray-500">
          Receitas x Despesas
        </span>
      </div>

      {/* Container do gráfico */}
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#42B7B2" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#42B7B2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />

            <Tooltip
              cursor={{ stroke: "#E5E7EB", strokeDasharray: "4 4" }}
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
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                fontSize: "12px",
                color: "#374151",
                paddingBottom: "12px",
              }}
            />

            <Area
              name="Receitas"
              type="monotone"
              dataKey="income"
              stroke="#42B7B2"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIncome)"
              activeDot={{ r: 4 }}
            />

            <Area
              name="Despesas"
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpense)"
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
