/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { ChevronsLeft, ChevronsRight, SquarePen, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmDialog } from "../ConfirmDialog/Index";

interface TransactionsListProps {
  type?: "income" | "expense" | "investment" | "all";
  exibirAcoes?: boolean;
  onEdit?: (item: any) => void;
  onRefresh?: () => void;
  month?: number;
  year?: number;
  goalId?: string; 
  variant?: "default" | "minimal";
}

export function TransactionsList({
  type = "all",
  exibirAcoes = true,
  onEdit,
  onRefresh,
  month,
  year,
  goalId,
  variant = "default",
}: TransactionsListProps) {
  const [todasTransacoes, setTodasTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<any | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (month && year) {
        params.append("month", String(month));
        params.append("year", String(year));
      }
      if (goalId) {
        params.append("goalId", goalId);
      }

      const queryString = params.toString();
      const url = `/transactions${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);

      const filtradosEOrdenados = response
        .filter((item: any) => {
          if (type !== "all" && item.type?.toUpperCase() !== type.toUpperCase()) {
            return false;
          }
          if (goalId && item.goalId !== goalId) {
            return false;
          }
          return true;
        })
        .sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (dateA !== dateB) return dateB - dateA;
          return String(b.id).localeCompare(String(a.id));
        });

      setTodasTransacoes(filtradosEOrdenados);
    } catch (error) {
      console.error("Erro ao carregar transações", error);
    } finally {
      setLoading(false);
    }
  }, [type, month, year, goalId]);

  useEffect(() => {
    loadTransactions();
    setPaginaAtual(1);
  }, [loadTransactions]);

  const handleDelete = (item: any) => {
    setTransacaoParaExcluir(item);
    setIsModalOpen(true);
  };

  const confirmDelete = async (deleteAll: boolean = false) => {
    if (!transacaoParaExcluir) return;

    try {
      const url = `/transactions/${transacaoParaExcluir.id}${deleteAll ? "?deleteAll=true" : ""}`;
      await api.delete(url);
      toast.success(deleteAll ? "Recorrências removidas!" : "Transação excluída!");
      if (onRefresh) onRefresh();
      loadTransactions();
    } catch (error: any) {
      toast.error("Erro ao excluir transação.");
      console.error(error);
    } finally {
      setIsModalOpen(false);
      setTransacaoParaExcluir(null);
    }
  };

  const totalPaginas = Math.ceil(todasTransacoes.length / itensPorPagina);
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const listaExibida = todasTransacoes.slice(indicePrimeiroItem, indiceUltimoItem);

  const titulos = {
    income: "Últimas Receitas",
    expense: "Últimas Despesas",
    investment: "Meus Investimentos",
    all: "Todas as Transações",
  };

  const typeConfigs: any = {
    income: { label: "Receita", color: "text-green-600", bg: "bg-green-50" },
    expense: { label: "Despesa", color: "text-red-600", bg: "bg-red-50" },
    investment: { label: "Investimento", color: "text-[#42B7B2]", bg: "bg-teal-50" },
  };

  const containerClasses = variant === "default" 
    ? "mt-8 bg-white rounded-lg border border-gray-100 shadow-sm" 
    : "w-full bg-transparent"; // Isso já garante que o container da tabela seja transparente

  const headerClasses = variant === "default"
    ? "p-4 flex justify-between items-center border-b border-gray-50"
    : "pb-4 flex justify-end items-center";

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {(variant === "default" || totalPaginas > 1) && (
        <div className={headerClasses}>
          {variant === "default" && (
            <h3 className="text-lg font-bold text-gray-700">{titulos[type]}</h3>
          )}
          {totalPaginas > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 mr-2">
                {paginaAtual}/{totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
                className="p-1 rounded hover:bg-gray-200/50 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
                className="p-1 rounded hover:bg-gray-200/50 disabled:opacity-30 transition cursor-pointer"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          {variant === "default" && (
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/60">
              <tr>
                <th className="px-6 py-4">Nome</th>
                {type === "all" && <th className="px-6 py-4">Tipo</th>}
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Categoria</th>
                {exibirAcoes && <th className="px-6 py-4 text-center">Ações</th>}
              </tr>
            </thead>
          )}

          <tbody className="divide-y divide-gray-200/50">
            {listaExibida.map((item) => {
              const itemType = item.type?.toLowerCase();
              const config = typeConfigs[itemType] || { color: "text-gray-600", label: itemType };

              // -------------------------------------------------------------
              // AQUI ESTÁ A MÁGICA
              // -------------------------------------------------------------
              // Verificamos se é minimal E se é investimento.
              const isInvestmentContext = variant === "minimal" && type === "investment";

              const rowClass = isInvestmentContext
                // SE FOR INVESTIMENTO NO MODAL:
                // bg-transparent: para mostrar o fundo cinza do modal
                // border-b border-gray-200/50: apenas uma linha fina separando
                ? "bg-transparent border-b border-gray-200/50 last:border-0 block sm:table-row"
                
                // CASO CONTRÁRIO (Comportamento antigo):
                : (variant === "minimal" 
                    // Card branco flutuante (para outras listas minimalistas)
                    ? "bg-white mb-2 rounded-xl shadow-sm border border-gray-100 block sm:table-row" 
                    // Tabela padrão
                    : "hover:bg-gray-50 transition-colors duration-150");

              return (
                <tr key={item.id} className={rowClass}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.title || item.name}
                  </td>

                  {type === "all" && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                  )}

                  <td className={`px-4 py-3 font-bold ${type === "all" ? config.color : typeConfigs[type].color}`}>
                    R$ {Number(item.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </td>
                  
                  <td className="px-4 py-3">
                      {/* Ajustei o fundo da pílula para ficar semi-transparente também */}
                      <span className="text-[10px] bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {item.category}
                      </span>
                  </td>

                  {exibirAcoes && (
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <SquarePen size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                         title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {todasTransacoes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100/50 rounded-full flex items-center justify-center text-gray-400">
                {type === 'investment' ? <span className="font-bold text-xl">$</span> : <span className="font-bold text-xl">?</span>}
            </div>
            <p className="text-gray-500 text-xs italic px-10">
              Nenhum aporte encontrado.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        title="Confirmar exclusão"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransacaoParaExcluir(null);
        }}
        onConfirm={confirmDelete}
        message="Tem certeza que deseja excluir?"
        isGroup={!!transacaoParaExcluir?.groupId}
      />
    </div>
  );
}