type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteAll: boolean) => void;
  title: string;
  message: string;
  isGroup?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isGroup,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {message}
        </p>

        {/* Ações */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700
                         hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={() => onConfirm(false)}
              className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white
                         hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition cursor-pointer"
            >
              {isGroup ? "Somente esta" : "Excluir"}
            </button>
          </div>

          {/* Ação avançada */}
          {isGroup && (
            <button
              onClick={() => onConfirm(true)}
              className="rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-semibold
                         uppercase tracking-wide text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              Excluir todas as parcelas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
