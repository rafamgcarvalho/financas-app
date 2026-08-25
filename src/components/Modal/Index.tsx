"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Conteúdo extra no cabeçalho, abaixo do título (ex.: seletor de tipo). */
  header?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

/**
 * Casca de modal usada pelos diálogos do app.
 *
 * No desktop é um cartão centralizado; no celular vira uma folha que sobe da
 * base, que é o padrão que o polegar alcança.
 */
export function Modal({ isOpen, onClose, title, subtitle, header, size = "md", children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    // Trava o scroll do fundo enquanto o modal está aberto.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div
        ref={panelRef}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-up sm:max-h-[88vh] sm:rounded-3xl sm:animate-scale-in ${SIZES[size]}`}
      >
        {(title || header) && (
          <div className="shrink-0 border-b border-slate-200 px-6 pb-4 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {title && <h2 className="text-lg font-bold text-navy-800">{title}</h2>}
                {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {header && <div className="mt-4">{header}</div>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
