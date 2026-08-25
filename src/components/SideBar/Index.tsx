"use client";

import {
  LayoutDashboard,
  HandCoins,
  BanknoteArrowDown,
  PiggyBank,
  Wallet,
  Settings,
  Plus,
} from "lucide-react";
import { SidebarItem } from "../SideBarItem/Index";
import { useTransactions } from "@/src/contexts/TransactionsProvider";

export const NAV_ITEMS = [
  { icon: LayoutDashboard, name: "Dashboard", url: "/" },
  { icon: HandCoins, name: "Receitas", url: "/receitas" },
  { icon: BanknoteArrowDown, name: "Despesas", url: "/despesas" },
  { icon: PiggyBank, name: "Investimentos", url: "/investimentos" },
  { icon: Settings, name: "Configurações", url: "/configuracoes" },
];

/** Navegação lateral do desktop. No celular quem navega é a <BottomNav>. */
export function SideBar() {
  const { openTransaction } = useTransactions();

  return (
    <aside className="hidden h-screen w-20 shrink-0 flex-col border-r border-white/5 bg-navy-700 text-white md:flex lg:w-60">
      <div className="flex h-20 items-center justify-center border-b border-white/5 lg:justify-start lg:px-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-brand-400" />
          <span className="hidden text-lg font-bold tracking-tight lg:block">Finance</span>
        </div>
      </div>

      {/* Ação principal do app, acessível de qualquer tela */}
      <div className="px-2 pt-4 lg:px-3">
        <button
          onClick={() => openTransaction()}
          title="Novo lançamento (N)"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-400 px-3 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 cursor-pointer lg:justify-start lg:px-4"
        >
          <Plus size={20} className="shrink-0" />
          <span className="hidden lg:block">Novo lançamento</span>
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-2 lg:px-3">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.url} icon={item.icon} name={item.name} url={item.url} />
        ))}
      </nav>

      <div className="mt-auto hidden px-5 pb-6 lg:block">
        <p className="text-[11px] leading-relaxed text-white/40">
          Dica: pressione <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-sans">N</kbd> para
          lançar rápido.
        </p>
      </div>
    </aside>
  );
}
