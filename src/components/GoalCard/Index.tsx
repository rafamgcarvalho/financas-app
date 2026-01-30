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
  // 1. Garantindo que são números (caso venham como string da API)
  const total = Number(totalValue) || 0;
  const invested = Number(investedValue) || 0;

  // 2. Cálculo de progresso seguro
  const progress = total > 0 ? Math.min((invested / total) * 100, 100) : 0;

  // 3. Formatador de moeda reutilizável
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const statusConfig = {
    ACTIVE: { label: "Ativa", badge: "bg-blue-100 text-blue-700" },
    PAUSED: { label: "Pausada", badge: "bg-yellow-100 text-yellow-700" },
    COMPLETED: { label: "Concluída", badge: "bg-green-100 text-green-700" },
  };

  return (
    <div
      onClick={onClick}
      className="min-w-[280px] cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 uppercase tracking-tight">
          {name}
        </h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusConfig[status].badge}`}>
          {statusConfig[status].label}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs text-gray-500 uppercase font-medium">Meta</p>
        <p className="text-lg font-bold text-gray-900">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-gray-500 uppercase font-medium">Investido</p>
        <p className="text-sm font-semibold text-blue-600">
          {formatCurrency(invested)}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs font-medium">
          <span className="text-gray-400">Progresso</span>
          <span className="text-gray-900">{progress.toFixed(0)}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === "COMPLETED" ? "bg-green-500" : 
              status === "PAUSED" ? "bg-yellow-400" : "bg-blue-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}