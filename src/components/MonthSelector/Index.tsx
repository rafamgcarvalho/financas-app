"use client";

import React, { useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel } from "@/src/lib/dates";

interface MonthSelectorProps {
  onChange: (month: number, year: number) => void;
  currentValue: string;
  minDate?: string;
  maxDate?: string;
}

function generateMonths(minStr?: string, maxStr?: string) {
  const now = new Date();

  const start = minStr ? new Date(minStr) : new Date(now.getFullYear(), now.getMonth() - 12, 1);
  const end = maxStr ? new Date(maxStr) : now;

  const startTotal = start.getUTCFullYear() * 12 + start.getUTCMonth();
  const endTotal = end.getUTCFullYear() * 12 + end.getUTCMonth();
  const nowTotal = now.getFullYear() * 12 + now.getMonth();

  // O mês corrente sempre entra, mesmo sem lançamentos ainda.
  const limitTotal = Math.max(endTotal, nowTotal);

  const months = [];
  for (let index = startTotal; index <= limitTotal; index++) {
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1;

    months.push({
      value: `${year}-${String(month).padStart(2, "0")}`,
      label: formatMonthLabel(month, year),
    });
  }

  return months;
}

export function MonthSelector({ onChange, currentValue, minDate, maxDate }: MonthSelectorProps) {
  const months = useMemo(() => generateMonths(minDate, maxDate), [minDate, maxDate]);
  const currentIndex = months.findIndex((month) => month.value === currentValue);

  const emit = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    onChange(month, year);
  };

  const step = (delta: number) => {
    const next = months[currentIndex + delta];
    if (next) emit(next.value);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {/* Navegar mês a mês é o gesto mais comum — antes só havia o dropdown. */}
      <button
        onClick={() => step(-1)}
        disabled={currentIndex <= 0}
        aria-label="Mês anterior"
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1.5 px-1">
        <Calendar size={15} className="text-slate-400" />
        <select
          value={currentValue}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => emit(event.target.value)}
          aria-label="Selecionar mês"
          className="bg-transparent py-1 text-sm font-medium text-navy-800 outline-none cursor-pointer"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => step(1)}
        disabled={currentIndex === -1 || currentIndex >= months.length - 1}
        aria-label="Próximo mês"
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
