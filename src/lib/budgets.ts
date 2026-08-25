import { readStorage, writeStorage } from "./storage";

/**
 * Orçamento mensal por categoria.
 *
 * Fica no navegador: é configuração do usuário, não dado transacional, e a API
 * atual não tem endpoint para isso. Se um dia houver, basta trocar o corpo
 * destas funções — o restante do app só conhece esta interface.
 */

export type BudgetMap = Record<string, number>;

export const BUDGETS_KEY = "budgets:v1";

export function getBudgets(): BudgetMap {
  return readStorage<BudgetMap>(BUDGETS_KEY, {});
}

export function setBudget(category: string, limit: number): void {
  const budgets = getBudgets();

  if (!limit || limit <= 0) {
    delete budgets[category];
  } else {
    budgets[category] = limit;
  }

  writeStorage(BUDGETS_KEY, budgets);
}

export function removeBudget(category: string): void {
  const budgets = getBudgets();
  delete budgets[category];
  writeStorage(BUDGETS_KEY, budgets);
}

export type BudgetStatus = "ok" | "warning" | "exceeded";

export function budgetStatus(spent: number, limit: number): BudgetStatus {
  const ratio = limit > 0 ? spent / limit : 0;

  if (ratio >= 1) return "exceeded";
  if (ratio >= 0.8) return "warning";
  return "ok";
}
