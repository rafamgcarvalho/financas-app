"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SideBar } from "@/src/components/SideBar/Index";
import { TopBar } from "@/src/components/TopBar/Index";
import { BottomNav } from "@/src/components/BottomNav/Index";
import { SpinLoader } from "@/src/components/SpinLoader/Index";
import { TransactionsProvider } from "@/src/contexts/TransactionsProvider";
import { useLocalValue } from "@/src/hooks/useLocalStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useLocalValue("token");

  useEffect(() => {
    // Lê o localStorage na hora do efeito, e não o snapshot da hidratação: no
    // primeiro render o valor ainda é o do servidor (null) e quem está logado
    // seria mandado para o login sem motivo.
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [token, router]);

  // Sem isso o conteúdo pisca por um instante antes do redirecionamento.
  if (!token) {
    return <SpinLoader className="min-h-screen" />;
  }

  return (
    <TransactionsProvider>
      <div className="flex h-screen overflow-hidden">
        <SideBar />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        <BottomNav />
      </div>
    </TransactionsProvider>
  );
}
