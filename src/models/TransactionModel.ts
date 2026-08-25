export type TransactionType = "INCOME" | "EXPENSE" | "INVESTMENT";

/** Tipo em minúsculas usado na navegação e nos filtros da interface. */
export type TransactionKind = "income" | "expense" | "investment";

/** Transação como o backend devolve. */
export type Transaction = {
  id: string;
  title: string;
  description?: string;
  amount: number | string;
  date: string;
  category: string;
  type: TransactionType | string;
  isRecurring?: boolean;
  installments?: number;
  /** Presente quando a transação faz parte de um parcelamento/recorrência. */
  groupId?: string;
  /** Índice da parcela dentro do grupo, quando o backend informa. */
  installmentNumber?: number;
  goalId?: string;
  userName?: string;
  createdAt?: string;
};

/** Payload enviado ao criar ou editar uma transação. */
export type TransactionPayload = {
  title: string;
  amount: number;
  description?: string;
  date: string;
  category: string;
  type: TransactionType;
  isRecurring: boolean;
  installments: number;
  goalId?: string;
};

/** Estado do formulário de lançamento. */
export type TransactionFormState = {
  title: string;
  description: string;
  /** Somente dígitos (centavos) — ver src/lib/money.ts. */
  amountDigits: string;
  date: string;
  category: string;
  recurring: boolean;
  installments: string;
};
