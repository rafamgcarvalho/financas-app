import { ArrowDownCircle, ArrowUpCircle, TrendingUp, type LucideIcon } from "lucide-react";
import type { TransactionKind } from "@/src/models/TransactionModel";

/**
 * Aparência de cada tipo de transação.
 *
 * Fonte única da verdade: receita é verde em TODO lugar, despesa é vermelha,
 * investimento é a cor da marca. Antes o card do dashboard e a tabela usavam
 * cores diferentes para o mesmo tipo.
 *
 * As classes são strings literais de propósito — o Tailwind precisa vê-las
 * inteiras para gerar o CSS.
 */
export type TypeTheme = {
  label: string;
  plural: string;
  icon: LucideIcon;
  /** Cor do texto do valor e dos rótulos. */
  text: string;
  /** Fundo suave para pílulas e chips. */
  soft: string;
  softBorder: string;
  /** Fundo cheio para botões e barras. */
  solid: string;
  solidHover: string;
  ring: string;
  /** Hex para gráficos (recharts não aceita classe do Tailwind). */
  hex: string;
  /** Sinal exibido antes do valor nas listas ("" quando não se aplica). */
  sign: "+" | "−" | "";
};

export const TYPE_THEME: Record<TransactionKind, TypeTheme> = {
  income: {
    label: "Receita",
    plural: "Receitas",
    icon: ArrowUpCircle,
    text: "text-income-600",
    soft: "bg-income-50",
    softBorder: "border-income-100",
    solid: "bg-income-500",
    solidHover: "hover:bg-income-600",
    ring: "ring-income-500",
    hex: "#10b981",
    sign: "+",
  },
  expense: {
    label: "Despesa",
    plural: "Despesas",
    icon: ArrowDownCircle,
    text: "text-expense-600",
    soft: "bg-expense-50",
    softBorder: "border-expense-100",
    solid: "bg-expense-500",
    solidHover: "hover:bg-expense-600",
    ring: "ring-expense-500",
    hex: "#ef4444",
    sign: "−",
  },
  investment: {
    label: "Investimento",
    plural: "Investimentos",
    icon: TrendingUp,
    text: "text-invest-600",
    soft: "bg-invest-50",
    softBorder: "border-invest-100",
    solid: "bg-invest-500",
    solidHover: "hover:bg-invest-600",
    ring: "ring-invest-500",
    hex: "#2ba09b",
    // Aporte não é saída: o dinheiro muda de lugar, não some.
    sign: "",
  },
};

export function themeFor(type?: string): TypeTheme {
  const key = String(type ?? "").toLowerCase() as TransactionKind;
  return TYPE_THEME[key] ?? TYPE_THEME.expense;
}

export function toKind(type?: string): TransactionKind {
  const key = String(type ?? "").toLowerCase();
  return key === "income" || key === "investment" ? key : "expense";
}
