import { CalendarClock, Users } from "lucide-react";
import { GoalMember } from "@/src/models/GoalModel";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { formatMonthLabel } from "@/src/lib/dates";
import { GoalProjection } from "../GoalProjection/Index";
import type { GoalProjection as Projection } from "@/src/lib/goalProjection";

type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

type GoalCardProps = {
  name: string;
  totalValue: number;
  investedValue: number;
  status: GoalStatus;
  members?: GoalMember[];
  targetDate?: string;
  /** Quando presente, o card mostra ritmo e previsão de conclusão. */
  projection?: Projection;
  onClick?: () => void;
};

const STATUS_CONFIG: Record<
  GoalStatus | "OVERDUE",
  { label: string; badge: string; bar: string; accent: string }
> = {
  OVERDUE: {
    label: "Atrasada",
    badge: "bg-expense-50 text-expense-700 ring-expense-100",
    bar: "bg-expense-500",
    accent: "bg-expense-500",
  },
  ACTIVE: {
    label: "Ativa",
    badge: "bg-invest-50 text-invest-700 ring-invest-100",
    bar: "bg-brand-400",
    accent: "bg-brand-400",
  },
  PAUSED: {
    label: "Pausada",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-400",
    accent: "bg-amber-400",
  },
  COMPLETED: {
    label: "Concluída",
    badge: "bg-income-50 text-income-700 ring-income-100",
    bar: "bg-income-500",
    accent: "bg-income-500",
  },
};

export function GoalCard({
  name,
  totalValue,
  investedValue,
  status,
  members = [],
  targetDate,
  projection,
  onClick,
}: GoalCardProps) {
  const total = Number(totalValue) || 0;
  const invested = Number(investedValue) || 0;
  const progress = total > 0 ? Math.min((invested / total) * 100, 100) : 0;
  const remaining = Math.max(total - invested, 0);

  // Uma meta pode vencer sem que ninguém mude o status na mão — o prazo
  // estourado precisa aparecer, senão ela segue "ativa" para sempre.
  const isOverdue = projection?.status === "overdue";
  const config = isOverdue
    ? STATUS_CONFIG.OVERDUE
    : (STATUS_CONFIG[status] ?? STATUS_CONFIG.ACTIVE);
  const isShared = members.length > 1;

  const alvo = targetDate ? new Date(targetDate) : null;
  const alvoLabel =
    alvo && !Number.isNaN(alvo.getTime())
      ? formatMonthLabel(alvo.getUTCMonth() + 1, alvo.getUTCFullYear()).toLowerCase()
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg cursor-pointer"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${config.accent}`} />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold uppercase tracking-wide text-navy-800">{name}</h3>

          <div className="flex shrink-0 items-center gap-2">
            {isShared && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 ring-1 ring-slate-200">
                <Users size={10} />
                {members.length}
              </span>
            )}

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ring-1 ${config.badge}`}
            >
              {config.label}
            </span>
          </div>
        </div>

        {isShared && (
          <div className="mt-3 flex items-center gap-1">
            {members.slice(0, 4).map((member, index) => (
              <div
                key={member.userId}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-[9px] font-bold text-white ring-2 ring-white"
                style={{ marginLeft: index > 0 ? "-4px" : 0, zIndex: 10 - index }}
                title={member.name}
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {members.length > 4 && (
              <span className="ml-1 text-[10px] font-medium text-slate-400">+{members.length - 4}</span>
            )}
          </div>
        )}

        {/* O valor investido é o número que importa aqui; a meta é a referência. */}
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Investido</p>
          <p className="text-2xl font-bold tracking-tight text-navy-800">{formatCurrency(invested)}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            de {formatCurrency(total)}
            {remaining > 0 && ` · faltam ${formatCurrency(remaining)}`}
          </p>

          {alvoLabel && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
              <CalendarClock size={12} />
              alvo em {alvoLabel}
            </p>
          )}
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs font-medium">
            <span className="uppercase tracking-wide text-slate-400">Progresso</span>
            <span className="text-navy-800">{progress.toFixed(0)}%</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {projection && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <GoalProjection projection={projection} />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
