"use client";

import React, { useMemo } from "react";
import { Calendar } from "lucide-react";

interface MonthSelectorProps {
  onChange: (month: number, year: number) => void;
  currentValue: string;
}

// Função para gerar a lista dos últimos 12 meses
function generateLast12Months() {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const label = new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "long",
    }).format(date);

    const value = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    months.push({
      value,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    });
  }

  return months.reverse();
}

export function MonthSelector({
  onChange,
  currentValue,
}: MonthSelectorProps) {
  const months = useMemo(() => generateLast12Months(), []);

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
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
        className="
          bg-transparent text-sm font-medium text-gray-700
          focus:outline-none
          cursor-pointer
        "
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
  );
}
