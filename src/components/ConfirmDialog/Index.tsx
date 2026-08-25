"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteAll: boolean) => void;
  title: string;
  message: string;
  /** Quando a transação faz parte de um parcelamento/recorrência. */
  isGroup?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isGroup,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4" role="alertdialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-expense-50 text-expense-600">
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-navy-800">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={() => onConfirm(false)}
              autoFocus
              className="flex-1 rounded-xl bg-expense-500 py-3 text-sm font-semibold text-white transition hover:bg-expense-600 cursor-pointer"
            >
              {isGroup ? "Somente esta" : "Excluir"}
            </button>
          </div>

          {isGroup && (
            <button
              onClick={() => onConfirm(true)}
              className="rounded-xl border border-expense-100 bg-expense-50 py-3 text-xs font-semibold uppercase tracking-wide text-expense-600 transition hover:bg-expense-100 cursor-pointer"
            >
              Excluir todas as parcelas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
