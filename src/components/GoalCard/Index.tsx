type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

type GoalCardProps = {
  name: string;
  totalValue: number;
  investedValue: number;
  status: GoalStatus;
  onClick?: () => void;
};

export function GoalCard({
  name,
  totalValue,
  investedValue,
  status,
  onClick,
}: GoalCardProps) {
  const total = Number(totalValue) || 0;
  const invested = Number(investedValue) || 0;

  const progress = total > 0 ? Math.min((invested / total) * 100, 100) : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const statusConfig = {
    ACTIVE: { label: "Ativa", badge: "bg-blue-50 text-blue-700 ring-blue-200" },
    PAUSED: {
      label: "Pausada",
      badge: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    },
    COMPLETED: {
      label: "Concluída",
      badge: "bg-green-50 text-green-700 ring-green-200",
    },
  };

  return (
    <div
      onClick={onClick}
      className="
      relative
      min-w-[320px]
      cursor-pointer
      rounded-2xl
      border border-gray-200/60
      bg-linear-to-br from-white to-gray-50
      p-6
      shadow-[0_8px_24px_rgba(0,0,0,0.06)]
      transition-all duration-300
      hover:-translate-y-1
      hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]
    "
    >
      {/* Accent lateral */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
          status === "COMPLETED"
            ? "bg-green-500"
            : status === "PAUSED"
              ? "bg-yellow-400"
              : "bg-blue-600"
        }`}
      />

      {/* Conteúdo */}
      <div className="pl-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 tracking-wide uppercase">
            {name}
          </h3>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ring-1 ${
              statusConfig[status].badge
            }`}
          >
            {statusConfig[status].label}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Meta
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Investido
            </p>
            <p className="text-sm font-semibold text-blue-600">
              {formatCurrency(invested)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs font-medium">
            <span className="text-gray-400 uppercase tracking-wide">
              Progresso
            </span>
            <span className="text-gray-900">{progress.toFixed(0)}%</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200/60">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                status === "COMPLETED"
                  ? "bg-green-500"
                  : status === "PAUSED"
                    ? "bg-yellow-400"
                    : "bg-blue-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
