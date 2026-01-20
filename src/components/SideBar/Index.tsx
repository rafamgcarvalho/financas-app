"use client";

import {
  LayoutDashboard,
  HandCoins,
  BanknoteArrowDown,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { SidebarItem } from "../SideBarItem/Index";

export function SideBar() {
  return (
    <aside className="h-screen w-20 md:w-56 bg-[#22324B] text-white flex flex-col border-r border-white/5">
      
      {/* Logo */}
      <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-[#42B7B2]" />
          <span className="hidden md:block text-lg font-bold tracking-tight">
            Finance
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-1 mt-4 px-2 md:px-3">
        <SidebarItem
          icon={LayoutDashboard}
          name="Dashboard"
          url="/"
        />
        <SidebarItem
          icon={HandCoins}
          name="Receitas"
          url="/receitas"
        />
        <SidebarItem
          icon={BanknoteArrowDown}
          name="Despesas"
          url="/despesas"
        />
        <SidebarItem
          icon={PiggyBank}
          name="Investimentos"
          url="/investimentos"
        />
      </nav>
    </aside>
  );
}
