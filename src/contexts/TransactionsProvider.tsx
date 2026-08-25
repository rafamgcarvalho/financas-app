"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TransactionModal } from "../components/TransactionModal/Index";
import { inputDateToISO, todayInput } from "@/src/lib/dates";
import type { Transaction, TransactionKind } from "@/src/models/TransactionModel";

type OpenOptions = {
  type?: TransactionKind;
  transaction?: Transaction | null;
  goalId?: string;
};

type TransactionsContextValue = {
  /** Abre o modal de lançamento (novo ou edição). */
  openTransaction: (options?: OpenOptions) => void;
  /** Abre um lançamento novo já preenchido com os dados de outro. */
  duplicateTransaction: (transaction: Transaction) => void;
  closeTransaction: () => void;
  /** Muda a cada gravação — use como dependência para recarregar listas. */
  refreshToken: number;
  /** Avisa o app que os dados mudaram (exclusão, importação etc.). */
  notifyChange: () => void;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error("useTransactions precisa estar dentro de <TransactionsProvider>");
  }

  return context;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

/**
 * Mantém um único modal de lançamento montado para todo o app e distribui o
 * sinal de "os dados mudaram" para as telas que listam transações.
 */
export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({});
  const [refreshToken, setRefreshToken] = useState(0);
  // Incrementa a cada abertura para remontar o modal com o estado inicial certo.
  const [openCount, setOpenCount] = useState(0);

  const openTransaction = useCallback((next: OpenOptions = {}) => {
    setOptions(next);
    setOpenCount((prev) => prev + 1);
    setIsOpen(true);
  }, []);

  const closeTransaction = useCallback(() => setIsOpen(false), []);
  const notifyChange = useCallback(() => setRefreshToken((prev) => prev + 1), []);

  const duplicateTransaction = useCallback(
    (transaction: Transaction) => {
      // Sem id vira um lançamento novo; a data volta para hoje, que é o caso
      // comum de quem duplica ("paguei de novo").
      openTransaction({
        type: String(transaction.type).toLowerCase() as TransactionKind,
        transaction: { ...transaction, id: "", date: inputDateToISO(todayInput()) },
      });
    },
    [openTransaction],
  );

  // Atalho: "n" abre um lançamento novo de qualquer lugar do app.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "n" && event.key !== "N") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target) || isOpen) return;

      event.preventDefault();
      openTransaction();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, openTransaction]);

  const value = useMemo(
    () => ({ openTransaction, duplicateTransaction, closeTransaction, refreshToken, notifyChange }),
    [openTransaction, duplicateTransaction, closeTransaction, refreshToken, notifyChange],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}

      <TransactionModal
        key={openCount}
        isOpen={isOpen}
        onClose={closeTransaction}
        initialType={options.type}
        transaction={options.transaction}
        goalId={options.goalId}
        onSaved={notifyChange}
      />
    </TransactionsContext.Provider>
  );
}
