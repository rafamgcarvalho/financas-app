import { AlertTriangle, CalendarCheck, CircleCheckBig, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatMonthLabel } from "@/src/lib/dates";
import type { GoalProjection as Projection } from "@/src/lib/goalProjection";

type GoalProjectionProps = {
  projection: Projection;
  variant?: "compact" | "full";
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

export function GoalProjection({ projection, variant = "compact" }: GoalProjectionProps) {
  const { text, tone } = summary(projection);

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
            <span className="text-xs text-slate-500">Ritmo atual</span>
            <span className="text-sm font-semibold text-navy-800">
              {projection.monthlyPace ? `${formatCurrency(projection.monthlyPace)}/mês` : "sem aportes"}
            </span>
          </div>

          {projection.monthlyPace ? (
            <p className="text-[11px] text-slate-400">
              média dos últimos {projection.paceWindowMonths}{" "}
              {projection.paceWindowMonths === 1 ? "mês" : "meses"}
            </p>
          ) : null}

          {projection.finishMonth && (
            <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">Nesse ritmo, conclui em</span>
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
        </div>
      )}
    </section>
  );
}
