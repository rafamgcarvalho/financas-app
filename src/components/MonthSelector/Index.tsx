"use client";

import React, { useMemo } from "react";
import { Calendar } from "lucide-react";

interface MonthSelectorProps {
  onChange: (month: number, year: number) => void;
  currentValue: string;
  minDate?: string;
  maxDate?: string;
}

function generateDynamicMonths(minStr?: string, maxStr?: string) {
  const months = [];
  const now = new Date();

  const start = minStr ? new Date(minStr) : new Date(now.getFullYear(), now.getMonth() - 12, 1);
  const end = maxStr ? new Date(maxStr) : now;

  const startTotal = start.getUTCFullYear() * 12 + start.getUTCMonth();
  const endTotal = end.getUTCFullYear() * 12 + end.getUTCMonth();
  const nowTotal = now.getFullYear() * 12 + now.getMonth();

  const limitTotal = Math.max(endTotal, nowTotal);

  for (let i = startTotal; i <= limitTotal; i++) {
    const year = Math.floor(i / 12);
    const month = i % 12;

    const value = `${year}-${String(month + 1).padStart(2, "0")}`;
    
    const dateForLabel = new Date(year, month, 15);
    const label = new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "long",
    }).format(dateForLabel);

    months.push({
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
  }

  return months;
}

export function MonthSelector({
  onChange,
  currentValue,
  minDate,
  maxDate,
}: MonthSelectorProps) {
  const months = useMemo(
    () => generateDynamicMonths(minDate, maxDate),
    [minDate, maxDate],
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const [year, month] = value.split("-").map(Number);
    onChange(month, year);
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm transition hover:border-gray-300">
      <Calendar size={16} className="text-gray-500" />

      <select
        id="month-select"
        value={currentValue}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
