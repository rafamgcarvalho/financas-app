"use client";

import { Container } from "@/src/components/Container/Index";

export default function InvestimentosPage() {

  return (
    <Container>
      <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Adicionar Nova Receita
        </h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Ex: Salário Mensal"
                required
                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
              />
            </div>

            <div>
              <label
                htmlFor="valor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Valor (R$)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                step="0.01"
                required
                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detalhes sobre a origem da receita..."
              className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label
                htmlFor="data"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data
              </label>
              <input
                type="date"
                id="transactionDate"
                name="transactionDate"
                required
                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoria
              </label>
              {/* <select
                id="category"
                name="category"
                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))} */}
              {/* </select> */}
            </div>

            <div className="flex items-center">
              <input
                id="recurring"
                name="recurring"
                type="checkbox"
                className="h-4 w-4 text-[#42B7B2] border-gray-300 rounded focus:ring-[#42B7B2]"
              />
              <label
                htmlFor="recurring"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                É Recorrente (Mensal)
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button>
              Salvando
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}
