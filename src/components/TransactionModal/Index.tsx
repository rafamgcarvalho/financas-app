"use client";

import { useState } from "react";
import { Modal } from "../Modal/Index";
import { TransactionForm } from "../TransactionForm/Index";
import { TYPE_THEME } from "@/src/lib/transactionTheme";
import type { Transaction, TransactionKind } from "@/src/models/TransactionModel";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Tipo pré-selecionado ao abrir. */
  initialType?: TransactionKind;
  /** Preenchido = modo edição; o seletor de tipo some. */
  transaction?: Transaction | null;
  goalId?: string;
  onSaved: () => void;
};

const TYPES: TransactionKind[] = ["income", "expense", "investment"];

/**
 * Modal único de lançamento.
 *
 * Substitui os formulários fixos no topo de Receitas e Despesas: um só lugar
 * cria e edita os três tipos, acessível de qualquer tela, sem tirar o usuário
 * do contexto nem perder o mês e a página que ele estava vendo.
 */
export function TransactionModal({
  isOpen,
  onClose,
  initialType = "expense",
  transaction,
  goalId,
  onSaved,
}: TransactionModalProps) {
  // O provider remonta este modal a cada abertura, então o tipo pedido por quem
  // chamou (ou o da transação em edição) já entra como estado inicial.
  const [type, setType] = useState<TransactionKind>(() =>
    transaction?.type ? (String(transaction.type).toLowerCase() as TransactionKind) : initialType,
  );
  const isEditing = Boolean(transaction?.id);

  const typeSelector = isEditing ? null : (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
      {TYPES.map((option) => {
        const theme = TYPE_THEME[option];
        const Icon = theme.icon;
        const active = type === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition cursor-pointer sm:text-sm ${
              active ? `bg-white shadow-sm ${theme.text}` : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={15} />
            {theme.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEditing ? `Editar ${TYPE_THEME[type].label.toLowerCase()}` : "Novo lançamento"}
      subtitle={
        isEditing
          ? "As alterações valem apenas para este lançamento."
          : "Escolha o tipo e preencha os dados."
      }
      header={typeSelector}
    >
      <TransactionForm
        // Trocar o tipo remonta o formulário, limpando a categoria do tipo anterior.
        key={`${type}-${transaction?.id ?? "new"}`}
        type={type}
        initialData={transaction}
        goalId={goalId}
        onSaved={onSaved}
        onCancel={onClose}
        onDone={onClose}
      />
    </Modal>
  );
}
