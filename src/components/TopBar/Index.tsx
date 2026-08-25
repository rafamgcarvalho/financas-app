"use client";

import { usePathname } from "next/navigation";
import { Plus, Wallet } from "lucide-react";
import UserDropdown from "../UserDropdown/Index";
import { NAV_ITEMS } from "../SideBar/Index";
import { useTransactions } from "@/src/contexts/TransactionsProvider";

function currentPageName(pathname: string): string {
  const match = NAV_ITEMS.find((item) =>
    item.url === "/" ? pathname === "/" : pathname.startsWith(item.url),
  );

  return match?.name ?? "Finance";
}

/**
 * Barra superior comum a todas as telas.
 *
 * Antes o menu do usuário existia apenas dentro do dashboard — em Receitas e
 * Despesas não havia como sair da conta.
 */
export function TopBar() {
  const pathname = usePathname();
  const { openTransaction } = useTransactions();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Wallet className="h-6 w-6 shrink-0 text-brand-400 md:hidden" />
          <span className="truncate text-sm font-semibold text-navy-800 md:text-xs md:font-semibold md:uppercase md:tracking-wide md:text-slate-400">
            {currentPageName(pathname)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openTransaction()}
            title="Novo lançamento (N)"
            className="hidden items-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 cursor-pointer md:flex"
          >
            <Plus size={16} />
            Novo lançamento
          </button>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
