"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarCheck, ChevronDown, CircleCheckBig, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatMonthLabel } from "@/src/lib/dates";
import {
  buildSchedule,
  MAX_SCHEDULE_MONTHS,
  type GoalProjection as Projection,
} from "@/src/lib/goalProjection";

type GoalProjectionProps = {
  projection: Projection;
  variant?: "compact" | "full";
  /** Necessário para montar o cronograma mês a mês. */
  goal?: { targetValue: number | string; currentValue: number | string };
};

function monthLabel(period: { month: number; year: number } | null): string {
  if (!period) return "—";
  return formatMonthLabel(period.month, period.year).toLowerCase();
}

/** Frase curta que resume a situação, para o card da lista. */
function summary(projection: Projection): { text: string; tone: "good" | "warn" | "bad" | "muted" } {
  switch (projection.status) {
    case "completed":
      return { text: "Meta concluída", tone: "good" };

    case "no-contributions":
      return { text: "Sem aportes recentes — sem ritmo para projetar", tone: "muted" };

    case "overdue":
      return { text: `Prazo venceu em ${monthLabel(projection.targetMonth)}`, tone: "bad" };

    case "no-target-date":
      return { text: `No ritmo atual, conclui em ${monthLabel(projection.finishMonth)}`, tone: "muted" };

    case "on-track":
      return { text: `No ritmo atual, conclui em ${monthLabel(projection.finishMonth)}`, tone: "good" };

    case "behind": {
      const meses = projection.monthsOffTarget ?? 0;
      return {
        text: `Conclui em ${monthLabel(projection.finishMonth)} — ${meses} ${meses === 1 ? "mês" : "meses"} depois do alvo`,
        tone: "warn",
      };
    }
  }
}

const TONES = {
  good: "text-income-600",
  warn: "text-amber-600",
  bad: "text-expense-600",
  muted: "text-slate-400",
};

export function GoalProjection({ projection, variant = "compact", goal }: GoalProjectionProps) {
  const { text, tone } = summary(projection);
  const [openSchedule, setOpenSchedule] = useState(false);
  // "target" só existe quando há data-alvo; senão o único plano possível é o ritmo.
  const [mode, setMode] = useState<"pace" | "target">("target");

  const canTarget = projection.requiredMonthly !== null && projection.targetMonth !== null;
  const effectiveMode = canTarget ? mode : "pace";

  const schedule = useMemo(
    () => (goal ? buildSchedule(projection, goal, effectiveMode) : null),
    [goal, projection, effectiveMode],
  );

  if (variant === "compact") {
    return (
      <p className={`flex items-start gap-1.5 text-[11px] leading-snug ${TONES[tone]}`}>
        {tone === "warn" || tone === "bad" ? (
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
        ) : (
          <TrendingUp size={12} className="mt-0.5 shrink-0" />
        )}
        {text}
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <TrendingUp size={13} />
        Projeção
      </h4>

      {projection.status === "completed" ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-income-600">
          <CalendarCheck size={16} />
          Meta concluída.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-slate-500">
              {projection.paceSource === "plan" ? "Planejado" : "Ritmo atual"}
            </span>
            <span className="text-sm font-semibold text-navy-800">
              {projection.monthlyPace ? `${formatCurrency(projection.monthlyPace)}/mês` : "sem aportes"}
            </span>
          </div>

          {projection.paceSource === "observed" && projection.monthlyPace ? (
            <p className="text-[11px] text-slate-400">
              mediana dos últimos {projection.paceWindowMonths}{" "}
              {projection.paceWindowMonths === 1 ? "mês" : "meses"}
            </p>
          ) : null}

          {/* Com plano declarado, o histórico vira aferição: mostra se o plano
              vem sendo cumprido sem que um mês fora da curva mexa na data. */}
          {projection.paceSource === "plan" && projection.observedPace !== null && (
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Ritmo real ({projection.paceWindowMonths}{" "}
                  {projection.paceWindowMonths === 1 ? "mês" : "meses"})
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatCurrency(projection.observedPace)}/mês
                </span>
              </div>

              <p
                className={`mt-1 text-[11px] font-medium ${
                  projection.observedPace >= (projection.monthlyPace ?? 0)
                    ? "text-income-600"
                    : "text-amber-600"
                }`}
              >
                {projection.observedPace >= (projection.monthlyPace ?? 0)
                  ? "Você está cumprindo o plano."
                  : "Abaixo do planejado — a projeção assume o plano."}
              </p>
            </div>
          )}

          {projection.finishMonth && (
            <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
              {projection.paceSource === "plan" ? "Nesse plano, conclui em" : "Nesse ritmo, conclui em"}
            </span>
              <span className="text-sm font-semibold text-navy-800">
                {monthLabel(projection.finishMonth)}
              </span>
            </div>
          )}

          {projection.targetMonth && (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-slate-500">Data-alvo</span>
              <span className="text-sm font-medium text-slate-600">
                {monthLabel(projection.targetMonth)}
              </span>
            </div>
          )}

          {/* O número acionável: dá para decidir entre aportar mais ou mover a data. */}
          {projection.requiredMonthly !== null && projection.status !== "on-track" && (
            <p
              className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                projection.status === "overdue"
                  ? "bg-expense-50 text-expense-700"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {projection.status === "overdue" ? (
                <>
                  O prazo venceu em {monthLabel(projection.targetMonth)} e ainda faltam{" "}
                  <strong>{formatCurrency(projection.remaining)}</strong>. Vale revisar a data-alvo.
                </>
              ) : (
                <>
                  Para chegar em {monthLabel(projection.targetMonth)}, seria preciso aportar{" "}
                  <strong>{formatCurrency(projection.requiredMonthly)}/mês</strong>.
                </>
              )}
            </p>
          )}

          {projection.status === "on-track" && (
            <p className="flex items-center gap-1.5 rounded-xl bg-income-50 px-3 py-2.5 text-xs font-medium text-income-700">
              <CircleCheckBig size={13} />
              No ritmo certo para bater o prazo.
            </p>
          )}

          {schedule && (
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setOpenSchedule((prev) => !prev)}
                className="flex w-full items-center justify-between text-xs font-medium text-slate-600 cursor-pointer"
              >
                Ver mês a mês
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${openSchedule ? "rotate-180" : ""}`}
                />
              </button>

              {openSchedule && (
                <div className="mt-3">
                  {canTarget && (
                    <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                      {(
                        [
                          { key: "target", label: "Para bater o alvo" },
                          {
                            key: "pace",
                            label: projection.paceSource === "plan" ? "No plano" : "No ritmo atual",
                          },
                        ] as const
                      ).map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setMode(option.key)}
                          className={`rounded-md px-2 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                            effectiveMode === option.key
                              ? "bg-white text-navy-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="mb-2 text-[11px] text-slate-500">
                    {schedule.rows.length} {schedule.rows.length === 1 ? "aporte" : "aportes"} de{" "}
                    <strong className="text-navy-800">{formatCurrency(schedule.monthly)}</strong>
                    {effectiveMode === "target"
                      ? " para chegar na data-alvo"
                      : projection.paceSource === "plan"
                        ? " mantendo o plano"
                        : " mantendo o ritmo atual"}
                  </p>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Mês</th>
                          <th className="px-3 py-2 text-right font-semibold">Aporte</th>
                          <th className="px-3 py-2 text-right font-semibold">Acumulado</th>
                          <th className="px-3 py-2 text-right font-semibold">%</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {schedule.rows.map((row) => (
                          <tr key={`${row.year}-${row.month}`} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2 text-slate-600">
                              {monthLabel({ month: row.month, year: row.year })}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                              {formatCurrency(row.contribution)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium tabular-nums text-navy-800">
                              {formatCurrency(row.accumulated)}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-400">
                              {row.percent.toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {schedule.truncated && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-600">
                      <AlertTriangle size={11} />
                      Mostrando os primeiros {MAX_SCHEDULE_MONTHS} meses — nesse ritmo a meta passa
                      de 10 anos.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
