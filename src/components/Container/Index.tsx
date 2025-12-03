type ContainerProps = {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      {children}
    </div>
  );
}