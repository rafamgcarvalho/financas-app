// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { Container } from "@/src/components/Container/Index";
// import { MonthSelector } from "@/src/components/MonthSelector/Index";
// import { TransactionForm } from "@/src/components/TransactionForm/Index";
// import { TransactionsList } from "@/src/components/TransactionsList/Index";
// import { useState } from "react";

// const categories = [
//   { value: "alimentacao", label: "Alimentação" },
//   { value: "moradia", label: "Moradia (Aluguel/Luz)" },
//   { value: "transporte", label: "Transporte" },
//   { value: "lazer", label: "Lazer" },
//   { value: "saude", label: "Saúde" },
//   { value: "educacao", label: "Educação" },
//   { value: "outros", label: "Outros" },
// ];

// export default function DespesasPage() {
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [editingTransaction, setEditingTransaction] = useState<any>(null);

//   const [selectedDate, setSelectedDate] = useState({
//     month: new Date().getMonth() + 1,
//     year: new Date().getFullYear(),
//   });

//   const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

//   const handleSuccess = () => {
//     setRefreshKey((prev) => prev + 1);
//     setEditingTransaction(null);
//   };

//   const handleEdit = (transaction: any) => {
//     setEditingTransaction(transaction);
//   };

//   return (
//     <Container>
//       <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
//         <h2 className="text-2xl font-bold mb-6 text-gray-800">
//           {editingTransaction ? "Editar Despesa" : "Adicionar Nova Despesa"}
//         </h2>

//         <TransactionForm
//           type="expense"
//           buttonLabel="Salvar Despesa"
//           categories={categories}
//           onSuccess={handleSuccess}
//           initialData={editingTransaction}
//         ></TransactionForm>

//         <hr className="my-10 border-gray-100" />

//         <MonthSelector
//           currentValue={dateValue}
//           onChange={(month, year) => setSelectedDate({ month, year })}
//         />

//         <TransactionsList
//           key={refreshKey}
//           type="expense"
//           exibirAcoes={true}
//           onEdit={handleEdit}
//           month={selectedDate.month}
//           year={selectedDate.year}
//         ></TransactionsList>
//       </div>
//     </Container>
//   );
// }





/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Container } from "@/src/components/Container/Index";
import { MonthSelector } from "@/src/components/MonthSelector/Index";
import { TransactionForm } from "@/src/components/TransactionForm/Index";
import { TransactionsList } from "@/src/components/TransactionsList/Index";
import { useState } from "react";

const categories = [
  { value: "alimentacao", label: "Alimentação" },
  { value: "moradia", label: "Moradia (Aluguel/Luz)" },
  { value: "transporte", label: "Transporte" },
  { value: "lazer", label: "Lazer" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "outros", label: "Outros" },
];

export default function DespesasPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const dateValue = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
  };

  return (
    <Container>
      <div className="flex flex-col gap-8">

        {/* 🔹 Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Despesas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle e acompanhe todos os seus gastos
          </p>
        </div>

        {/* 🔹 Card do Formulário */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {editingTransaction ? "Editar Despesa" : "Adicionar Nova Despesa"}
          </h2>

          <TransactionForm
            type="expense"
            buttonLabel="Salvar Despesa"
            categories={categories}
            onSuccess={handleSuccess}
            initialData={editingTransaction}
          />
        </div>

        {/* 🔹 Card da Lista */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Histórico de Despesas
            </h2>

            <MonthSelector
              currentValue={dateValue}
              onChange={(month, year) => setSelectedDate({ month, year })}
            />
          </div>

          <TransactionsList
            key={`${refreshKey}-${dateValue}`}
            type="expense"
            exibirAcoes={true}
            onEdit={handleEdit}
            month={selectedDate.month}
            year={selectedDate.year}
          />
        </div>

      </div>
    </Container>
  );
}
