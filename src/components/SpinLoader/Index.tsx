import clsx from "clsx";

type SpinLoaderProps = {
  className?: string;
};

export function SpinLoader({ className = "" }: SpinLoaderProps) {
  return (
    <div className={clsx("flex items-center justify-center", className)} role="status" aria-label="Carregando">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-brand-400" />
    </div>
  );
}
