"use client";

import { forwardRef } from "react";
import { formatDigits, toDigits } from "@/src/lib/money";

type CurrencyInputProps = {
  /** Somente dígitos (centavos) — ver src/lib/money.ts. */
  value: string;
  onChange: (digits: string) => void;
  id?: string;
  placeholder?: string;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  autoComplete?: string;
};

const SIZES = {
  sm: { box: "px-3 py-2", prefix: "text-xs", input: "text-sm" },
  md: { box: "px-4 py-2.5", prefix: "text-sm", input: "text-base" },
  lg: { box: "px-4 py-3", prefix: "text-xl", input: "text-3xl font-bold tracking-tight" },
};

/**
 * Campo de dinheiro com R$ fixo e formatação conforme se digita.
 *
 * Nunca usa `type="number"`: no celular ele abre o teclado errado e força
 * ponto como separador decimal. O estado guarda só os dígitos e a exibição é
 * derivada, então "123456" aparece como 1.234,56 sem que o cursor brigue com a
 * pontuação.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    { value, onChange, id, placeholder = "0,00", invalid, size = "md", className = "", autoComplete = "off" },
    ref,
  ) {
    const styles = SIZES[size];

    return (
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white transition focus-within:border-brand-400 ${
          styles.box
        } ${invalid ? "border-expense-500" : "border-slate-200"} ${className}`}
      >
        <span className={`font-semibold text-slate-400 ${styles.prefix}`}>R$</span>

        <input
          id={id}
          ref={ref}
          inputMode="decimal"
          autoComplete={autoComplete}
          value={formatDigits(value)}
          onChange={(event) => onChange(toDigits(event.target.value))}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none placeholder:font-normal placeholder:text-slate-300 ${styles.input}`}
        />
      </div>
    );
  },
);
