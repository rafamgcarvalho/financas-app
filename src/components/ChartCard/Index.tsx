import { ChartNoAxesColumn } from "lucide-react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
};

/** Moldura comum dos gráficos: mesmo cabeçalho, mesma altura, mesmos estados. */
export function ChartCard({
  title,
  subtitle,
  action,
  loading,
  empty,
  emptyMessage = "Sem dados para este período.",
  children,
}: ChartCardProps) {
  return (
    <div className="flex h-[380px] w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-navy-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>

      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="h-full w-full animate-shimmer rounded-xl bg-slate-100" />
        ) : empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ChartNoAxesColumn size={20} />
            </div>
            <p className="max-w-[16rem] text-xs text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/** Estilo compartilhado dos tooltips do recharts. */
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e9edf3",
    boxShadow: "0 10px 24px -8px rgba(15, 23, 42, 0.18)",
    padding: "10px 12px",
  },
  labelStyle: { fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 },
  itemStyle: { fontSize: 12, color: "#0f172a" },
};

export const AXIS_STYLE = {
  axisLine: false as const,
  tickLine: false as const,
  tick: { fill: "#94a3b8", fontSize: 11 },
};
