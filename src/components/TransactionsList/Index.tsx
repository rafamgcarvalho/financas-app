"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Inbox,
  Layers,
  Repeat,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/src/services/api";
import { ConfirmDialog } from "../ConfirmDialog/Index";
import { CategoryPill } from "../CategoryPill/Index";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatDateBR, formatMonthLabel } from "@/src/lib/dates";
import { findCategory } from "@/src/lib/categories";
import { themeFor, toKind, TYPE_THEME } from "@/src/lib/transactionTheme";
import { downloadCsv, transactionsToCsv } from "@/src/lib/exportCsv";
import type { Transaction, TransactionKind } from "@/src/models/TransactionModel";

type ListType = TransactionKind | "all";
type SortKey = "date" | "amount" | "title";

interface TransactionsListProps {
  type?: ListType;
  exibirAcoes?: boolean;
  onEdit?: (item: Transaction) => void;
  onDuplicate?: (item: Transaction) => void;
  /** Chamado pelo estado vazio e pelo botão de ação da barra de ferramentas. */
  onCreate?: () => void;
  onRefresh?: () => void;
  month?: number;
  year?: number;
  /** Vários meses de uma vez; tem precedência sobre month/year. */
  months?: { month: number; year: number }[];
  goalId?: string;
  variant?: "default" | "minimal";
  /** Barra com busca, filtro de categoria e ordenação. */
  toolbar?: boolean;
  exportable?: boolean;
  title?: string;
  /** Recarrega a lista quando muda (vem do TransactionsProvider). */
  refreshToken?: number;
  /** Entrega os dados carregados para quem precisa deles fora da lista. */
  onLoaded?: (transactions: Transaction[]) => void;
}

const DEFAULT_TITLES: Record<ListType, string> = {
  income: "Receitas do período",
  expense: "Despesas do período",
  investment: "Investimentos",
  all: "Transações do período",
};

const EMPTY_MESSAGES: Record<ListType, { title: string; hint: string; cta: string }> = {
  income: {
    title: "Nenhuma receita neste período",
    hint: "Registre seus salários e entradas para acompanhar quanto entra por mês.",
    cta: "Adicionar receita",
  },
  expense: {
    title: "Nenhuma despesa neste período",
    hint: "Lance seus gastos para descobrir para onde o dinheiro está indo.",
    cta: "Adicionar despesa",
  },
  investment: {
    title: "Nenhum aporte neste período",
    hint: "Registre seus aportes para acompanhar a evolução do patrimônio.",
    cta: "Adicionar investimento",
  },
  all: {
    title: "Nenhuma transação neste período",
    hint: "Comece lançando uma receita ou uma despesa.",
    cta: "Novo lançamento",
  },
};

function ListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
          <div className="h-9 w-9 shrink-0 animate-shimmer rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-shimmer rounded bg-slate-200" />
            <div className="h-2.5 w-1/5 animate-shimmer rounded bg-slate-100" />
          </div>
          <div className="h-3 w-20 animate-shimmer rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

/** Marca visualmente parcelamentos e recorrências, invisíveis até agora. */
function RecurrenceBadge({ item }: { item: Transaction }) {
  if (item.isRecurring) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
        <Repeat size={10} />
        Mensal
      </span>
    );
  }

  const total = Number(item.installments ?? 1);
  if (total <= 1 && !item.groupId) return null;

  const current = item.installmentNumber;

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
      <Layers size={10} />
      {current && total > 1 ? `${current}/${total}` : total > 1 ? `${total}x` : "Parcelado"}
    </span>
  );
}

export function TransactionsList({
  type = "all",
  exibirAcoes = true,
  onEdit,
  onDuplicate,
  onCreate,
  onRefresh,
  month,
  year,
  months,
  goalId,
  variant = "default",
  toolbar = false,
  exportable = false,
  title,
  refreshToken,
  onLoaded,
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  // Em ref para que trocar o callback não dispare uma nova busca.
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  // A API busca um mês por vez; um período maior vira várias chamadas em
  // paralelo. Serializado para servir de dependência estável do useCallback.
  const periodsKey = useMemo(() => {
    const periods = months ?? (month && year ? [{ month, year }] : []);
    return JSON.stringify(periods);
  }, [months, month, year]);

  const loadTransactions = useCallback(async () => {
    const periods: { month: number; year: number }[] = JSON.parse(periodsKey);

    try {
      setLoading(true);

      const buildUrl = (period?: { month: number; year: number }) => {
        const params = new URLSearchParams();
        if (period) {
          params.append("month", String(period.month));
          params.append("year", String(period.year));
        }
        if (goalId) params.append("goalId", goalId);
        // Se a API souber filtrar por tipo, o payload já vem menor; o filtro
        // abaixo continua como rede de segurança caso ela ignore o parâmetro.
        if (type !== "all") params.append("type", type.toUpperCase());

        const query = params.toString();
        return `/transactions${query ? `?${query}` : ""}`;
      };

      const responses = periods.length
        ? await Promise.all(periods.map((period) => api.get<Transaction[]>(buildUrl(period))))
        : [await api.get<Transaction[]>(buildUrl())];

      // Uma transação pode voltar em mais de uma chamada; o id desempata.
      const byId = new Map<string, Transaction>();

      for (const response of responses) {
        for (const item of Array.isArray(response) ? response : []) {
          if (type !== "all" && String(item.type).toUpperCase() !== type.toUpperCase()) continue;
          if (goalId && item.goalId !== goalId) continue;
          byId.set(item.id, item);
        }
      }

      const list = Array.from(byId.values());
      setTransactions(list);
      onLoadedRef.current?.(list);
    } catch (error) {
      console.error("Erro ao carregar transações", error);
      setTransactions([]);
      onLoadedRef.current?.([]);
    } finally {
      setLoading(false);
    }
  }, [type, periodsKey, goalId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refreshToken]);

  // Categorias efetivamente presentes no período — filtrar por uma categoria
  // sem lançamentos não teria utilidade.
  const availableCategories = useMemo(() => {
    const values = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));
    return values
      .map((value) => findCategory(value))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [transactions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = transactions.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!term) return true;

      return (
        item.title?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        findCategory(item.category).label.toLowerCase().includes(term)
      );
    });

    const direction = sortDesc ? -1 : 1;

    return result.sort((a, b) => {
      if (sortKey === "amount") return (Number(a.amount) - Number(b.amount)) * direction;
      if (sortKey === "title") return a.title.localeCompare(b.title, "pt-BR") * direction;

      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff * direction;

      // Empate na data: o lançamento criado por último aparece primeiro.
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (createdA - createdB) * direction;
    });
  }, [transactions, search, categoryFilter, sortKey, sortDesc]);

  // Um filtro novo pode deixar a página atual fora do intervalo.
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, sortKey, sortDesc, perPage, periodsKey, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totals = useMemo(() => {
    const sum = (kind: TransactionKind) =>
      filtered
        .filter((t) => toKind(t.type) === kind)
        .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      all: filtered.reduce((acc, t) => acc + Number(t.amount), 0),
      income: sum("income"),
      expense: sum("expense"),
      investment: sum("investment"),
    };
  }, [filtered]);

  const handleDelete = (item: Transaction) => {
    setPendingDelete(item);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async (deleteAll = false) => {
    if (!pendingDelete) return;

    try {
      await api.delete(`/transactions/${pendingDelete.id}${deleteAll ? "?deleteAll=true" : ""}`);
      toast.success(deleteAll ? "Recorrências removidas!" : "Lançamento excluído!");
      onRefresh?.();
      loadTransactions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir lançamento.");
    } finally {
      setIsConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast.info("Nada para exportar neste período.");
      return;
    }

    const periods: { month: number; year: number }[] = JSON.parse(periodsKey);
    const period =
      periods.length === 1
        ? formatMonthLabel(periods[0].month, periods[0].year).replace(/\s+/g, "-").toLowerCase()
        : periods.length
          ? `${periods.length}-meses`
          : "todos";

    downloadCsv(`financas-${type}-${period}.csv`, transactionsToCsv(filtered));
  };

  const isFiltering = search.trim().length > 0 || categoryFilter !== "all";
  const empty = EMPTY_MESSAGES[type];
  const isMinimal = variant === "minimal";

  const containerClasses = isMinimal
    ? "w-full"
    : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

  return (
    <div className={containerClasses}>
      {/* Cabeçalho + barra de ferramentas */}
      {!isMinimal && (
        <div className="space-y-4 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-navy-800">{title ?? DEFAULT_TITLES[type]}</h3>
              <p className="text-xs text-slate-500">
                {filtered.length} {filtered.length === 1 ? "lançamento" : "lançamentos"}
                {isFiltering && ` de ${transactions.length}`}
              </p>
            </div>

            {exportable && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <Download size={14} />
                Exportar CSV
              </button>
            )}
          </div>

          {toolbar && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, descrição ou categoria"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-brand-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-brand-400 cursor-pointer"
              >
                <option value="all">Todas as categorias</option>
                {availableCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-brand-400 cursor-pointer"
                >
                  <option value="date">Data</option>
                  <option value="amount">Valor</option>
                  <option value="title">Nome</option>
                </select>

                <button
                  onClick={() => setSortDesc((prev) => !prev)}
                  title={sortDesc ? "Maior primeiro" : "Menor primeiro"}
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowDownUp size={15} className={sortDesc ? "" : "rotate-180"} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Inbox size={22} />
          </div>

          {isFiltering ? (
            <>
              <p className="text-sm font-medium text-slate-600">Nenhum resultado para esses filtros</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                }}
                className="text-xs font-semibold text-brand-500 hover:underline cursor-pointer"
              >
                Limpar filtros
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-600">{empty.title}</p>
              <p className="max-w-xs text-xs text-slate-400">{empty.hint}</p>
              {onCreate && (
                <button
                  onClick={onCreate}
                  className="mt-1 rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-navy-800 cursor-pointer"
                >
                  {empty.cta}
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {/* Celular: cartões. Uma tabela nessa largura só rola para o lado. */}
          <ul className="divide-y divide-slate-100 sm:hidden">
            {visible.map((item) => {
              const theme = themeFor(item.type);
              const category = findCategory(item.category);

              return (
                <li key={item.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-navy-800">{item.title}</p>
                      <RecurrenceBadge item={item} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <CategoryPill category={category} />
                      <span className="text-[11px] text-slate-400">{formatDateBR(item.date)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-sm font-bold ${theme.text}`}>
                      {theme.sign && `${theme.sign} `}
                      {formatCurrency(Number(item.amount))}
                    </span>

                    {exibirAcoes && (
                      <div className="flex items-center gap-1">
                        {onDuplicate && (
                          <button
                            onClick={() => onDuplicate(item)}
                            aria-label="Duplicar"
                            className="p-1 text-slate-400 active:text-brand-500 cursor-pointer"
                          >
                            <Copy size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            aria-label="Editar"
                            className="p-1 text-slate-400 active:text-brand-500 cursor-pointer"
                          >
                            <SquarePen size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item)}
                          aria-label="Excluir"
                          className="p-1 text-slate-400 active:text-expense-500 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: tabela */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  {type === "all" && <th className="px-5 py-3 font-semibold">Tipo</th>}
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Data</th>
                  <th className="px-5 py-3 text-right font-semibold">Valor</th>
                  {exibirAcoes && <th className="px-5 py-3 text-right font-semibold">Ações</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visible.map((item) => {
                  const theme = themeFor(item.type);
                  const category = findCategory(item.category);

                  return (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy-800">{item.title}</span>
                          <RecurrenceBadge item={item} />

                          {/* Metas compartilhadas: quem fez o aporte */}
                          {item.userName && (
                            <span className="inline-flex items-center gap-1">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-[9px] font-bold text-white">
                                {item.userName.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">{item.userName}</span>
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{item.description}</p>
                        )}
                      </td>

                      {type === "all" && (
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${theme.soft} ${theme.text}`}
                          >
                            {theme.label}
                          </span>
                        </td>
                      )}

                      <td className="px-5 py-3.5">
                        <CategoryPill category={category} />
                      </td>

                      <td className="px-5 py-3.5 text-xs text-slate-500">{formatDateBR(item.date)}</td>

                      <td className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${theme.text}`}>
                        {theme.sign && `${theme.sign} `}
                        {formatCurrency(Number(item.amount))}
                      </td>

                      {exibirAcoes && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-60 transition group-hover:opacity-100">
                            {onDuplicate && (
                              <button
                                onClick={() => onDuplicate(item)}
                                title="Duplicar"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-brand-500 cursor-pointer"
                              >
                                <Copy size={15} />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                title="Editar"
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-brand-500 cursor-pointer"
                              >
                                <SquarePen size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item)}
                              title="Excluir"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-expense-500 cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rodapé: total do que está filtrado + paginação */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {type === "all" ? (
                <>
                  <span className="text-slate-500">
                    Receitas <strong className="text-income-600">{formatCurrency(totals.income)}</strong>
                  </span>
                  <span className="text-slate-500">
                    Despesas <strong className="text-expense-600">{formatCurrency(totals.expense)}</strong>
                  </span>
                  <span className="text-slate-500">
                    Investido <strong className="text-invest-600">{formatCurrency(totals.investment)}</strong>
                  </span>
                </>
              ) : (
                <span className="text-slate-500">
                  Total {isFiltering ? "filtrado" : "do período"}{" "}
                  <strong className={TYPE_THEME[type].text}>{formatCurrency(totals[type])}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {filtered.length > 5 && (
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  aria-label="Itens por página"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 outline-none cursor-pointer"
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} por página
                    </option>
                  ))}
                </select>
              )}

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-xs tabular-nums text-slate-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        title="Excluir lançamento"
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
        message={
          pendingDelete
            ? `"${pendingDelete.title}" de ${formatCurrency(Number(pendingDelete.amount))} será removido. Esta ação não pode ser desfeita.`
            : "Tem certeza que deseja excluir?"
        }
        isGroup={Boolean(pendingDelete?.groupId)}
      />
    </div>
  );
}
