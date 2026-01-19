/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { ChevronsLeft, ChevronsRight, SquarePen, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../ConfirmDialog/Index";

interface TransactionsListProps {
  type: "income" | "expense" | "investment";
  exibirAcoes?: boolean;
  onEdit?: (item: any) => void;
  month?: number;
  year?: number;
}

export function TransactionsList({
  type,
  exibirAcoes = true,
  onEdit,
  month,
  year
}: TransactionsListProps) {
  const [todasTransacoes, setTodasTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  
  const loadTransactions = useCallback(async () => {
      try {
        setLoading(true);

        let url = "/transactions";
        if (month && year) {
          url += `?month=${month}&year=${year}`;
        }

        // const response = await api.get("/transactions");
        const response = await api.get(url);

        const filtradosEOrdenados = response
          .filter(
            (item: any) => item.type?.toUpperCase() === type.toUpperCase(),
          )
          .sort((a: any, b: any) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          });

        setTodasTransacoes(filtradosEOrdenados);
      } catch (error) {
        console.error("Erro ao carregar", error);
      } finally {
        setLoading(false);
      }
    }, [type, month, year]);

  useEffect(() => {
    loadTransactions();
    setPaginaAtual(1);
  }, [loadTransactions]);

  const handleDelete = (id: string) => {
    setIdParaExcluir(id);
    setIsModalOpen(true);
  }

  // Função para excluir
  const confirmDelete = async () => {
    if (!idParaExcluir) return;

    try {
      await api.delete(`/transactions/${idParaExcluir}`);
      toast.success("Excluído com sucesso!");
      loadTransactions();
    } catch (error) {
      toast.error("Erro ao excluir transação.");
      console.log(error);
    } finally {
      setIsModalOpen(false);
      setIdParaExcluir(null);
    }
  };

  const totalPaginas = Math.ceil(todasTransacoes.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const listaExibida = todasTransacoes.slice(
    indicePrimeiroItem,
    indiceUltimoItem,
  );

  // Título dinâmico
  const titulos = {
    income: "Últimas Receitas",
    expense: "Últimas Despesas",
    investment: "Meus Investimentos",
  };

  if (loading) {
    return <p className="p-4 text-gray-500 animate-pulse">Carregando...</p>;
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="p-4 flex justify-between items-center border-b border-gray-50">
        <h3 className="text-lg font-bold text-gray-700">{titulos[type]}</h3>

        {totalPaginas > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 mr-2">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() =>
                setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
              }
              disabled={paginaAtual === totalPaginas}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-all"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Categoria</th>
              {exibirAcoes && <th className="px-6 py-4 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listaExibida.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.title || item.name}
                </td>
                <td
                  className={`px-6 py-4 font-bold ${
                    type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  R${" "}
                  {Number(item.amount).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4">
                  {new Date(item.date).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-semibold text-gray-600 uppercase">
                    {item.category}
                  </span>
                </td>
                {exibirAcoes && (
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                      title="Editar"
                      onClick={() => onEdit?.(item)}
                    >
                      <SquarePen size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {todasTransacoes.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            Nenhum registro encontrado.
          </div>
        )}
      </div>

      <ConfirmDialog title="Confirmar exclusão" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} message="Tem certeza que deseja excluir esta transação?"  />
    </div>
  );
}
