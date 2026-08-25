type ContainerProps = {
  children: React.ReactNode;
};

/**
 * Área de conteúdo das páginas.
 *
 * O fundo e a altura mínima ficam no layout — antes o Container repetia
 * `min-h-screen` dentro de um `<main>` que já rolava, e pintava um cinza
 * diferente do `body`. O padding inferior maior reserva espaço para a barra de
 * navegação do celular.
 */
export function Container({ children }: ContainerProps) {
  return <div className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 md:pb-10 lg:px-8">{children}</div>;
}
