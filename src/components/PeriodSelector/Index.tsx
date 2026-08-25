"use client";

import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { formatMonthLabel } from "@/src/lib/dates";

export type Period = { month: number; year: number };

export type PeriodPreset = "current" | "3m" | "6m" | "year" | "custom";

type PeriodSelectorProps = {
  value: { preset: PeriodPreset; from: Period; to: Period };
  onChange: (value: { preset: PeriodPreset; from: Period; to: Period }) => void;
  minDate?: string;
  maxDate?: string;
};

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: "current", label: "Este mês" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "year", label: "Este ano" },
  { key: "custom", label: "Personalizado" },
];

const toIndex = (period: Period) => period.year * 12 + (period.month - 1);
const fromIndex = (index: number): Period => ({
  year: Math.floor(index / 12),
  month: (index % 12) + 1,
});

/** Meses cobertos por um intervalo, do mais recente para o mais antigo. */
export function periodsBetween(from: Period, to: Period): Period[] {
  const start = Math.min(toIndex(from), toIndex(to));
  const end = Math.max(toIndex(from), toIndex(to));

  const periods: Period[] = [];
  for (let index = end; index >= start; index--) {
    periods.push(fromIndex(index));
  }

  // Guarda-chuva contra um intervalo absurdo virar dezenas de requisições.
  return periods.slice(0, 24);
}

export function presetRange(preset: PeriodPreset): { from: Period; to: Period } {
  const now = new Date();
  const to: Period = { month: now.getMonth() + 1, year: now.getFullYear() };

  if (preset === "3m") return { from: fromIndex(toIndex(to) - 2), to };
  if (preset === "6m") return { from: fromIndex(toIndex(to) - 5), to };
  if (preset === "year") return { from: { month: 1, year: to.year }, to };

  return { from: to, to };
}

export function periodLabel(preset: PeriodPreset, from: Period, to: Period): string {
  if (preset === "current") return formatMonthLabel(to.month, to.year);
  if (toIndex(from) === toIndex(to)) return formatMonthLabel(to.month, to.year);

  return `${formatMonthLabel(from.month, from.year)} — ${formatMonthLabel(to.month, to.year)}`;
}

function monthInputValue(period: Period): string {
  return `${period.year}-${String(period.month).padStart(2, "0")}`;
}

function parseMonthInput(value: string): Period | null {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return null;
  return { month, year };
}

/**
 * Seleção do período consultado.
 *
 * O app só permitia olhar um mês por vez; a maioria das perguntas úteis
 * ("quanto gastei no semestre?") precisa de mais que isso.
 */
export function PeriodSelector({ value, onChange, minDate, maxDate }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = useState(value.preset === "custom");

  const bounds = useMemo(() => {
    const min = minDate ? monthInputValue({
      month: new Date(minDate).getUTCMonth() + 1,
      year: new Date(minDate).getUTCFullYear(),
    }) : undefined;

    const now = new Date();
    const maxCandidate = maxDate ? new Date(maxDate) : now;
    const latest = maxCandidate > now ? maxCandidate : now;

    return {
      min,
      max: monthInputValue({ month: latest.getMonth() + 1, year: latest.getFullYear() }),
    };
  }, [minDate, maxDate]);

  const handlePreset = (preset: PeriodPreset) => {
    if (preset === "custom") {
      setShowCustom(true);
      onChange({ ...value, preset: "custom" });
      return;
    }

    setShowCustom(false);
    onChange({ preset, ...presetRange(preset) });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        <CalendarRange size={15} className="ml-2 mr-1 shrink-0 text-slate-400" />

        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePreset(preset.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              value.preset === preset.key
                ? "bg-navy-700 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <label className="text-xs text-slate-500">De</label>
          <input
            type="month"
            value={monthInputValue(value.from)}
            min={bounds.min}
            max={bounds.max}
            onChange={(e) => {
              const parsed = parseMonthInput(e.target.value);
              if (parsed) onChange({ ...value, preset: "custom", from: parsed });
            }}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-brand-400 cursor-pointer"
          />

          <label className="text-xs text-slate-500">até</label>
          <input
            type="month"
            value={monthInputValue(value.to)}
            min={bounds.min}
            max={bounds.max}
            onChange={(e) => {
              const parsed = parseMonthInput(e.target.value);
              if (parsed) onChange({ ...value, preset: "custom", to: parsed });
            }}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-brand-400 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
