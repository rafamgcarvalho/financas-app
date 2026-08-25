import { categoryLabel } from "./categories";
import { formatDateBR } from "./dates";
import type { Transaction } from "@/src/models/TransactionModel";

const TYPE_LABELS: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
  INVESTMENT: "Investimento",
};

function escapeCell(value: string): string {
  const needsQuotes = /[";\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/**
 * Gera um CSV com separador ";" e vírgula decimal — o formato que o Excel
 * brasileiro abre sem pedir configuração de importação.
 */
export function transactionsToCsv(transactions: Transaction[]): string {
  const header = ["Data", "Tipo", "Nome", "Categoria", "Valor", "Descrição", "Recorrente", "Parcelas"];

  const rows = transactions.map((t) => [
    formatDateBR(t.date),
    TYPE_LABELS[String(t.type).toUpperCase()] ?? String(t.type),
    t.title ?? "",
    categoryLabel(t.category),
    Number(t.amount).toFixed(2).replace(".", ","),
    t.description ?? "",
    t.isRecurring ? "Sim" : "Não",
    String(t.installments ?? 1),
  ]);

  return [header, ...rows].map((row) => row.map((cell) => escapeCell(String(cell))).join(";")).join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM para o Excel reconhecer os acentos como UTF-8.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
