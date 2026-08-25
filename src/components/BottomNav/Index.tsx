"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HandCoins,
  BanknoteArrowDown,
  PiggyBank,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useTransactions } from "@/src/contexts/TransactionsProvider";

const LEFT: { icon: LucideIcon; name: string; url: string }[] = [
  { icon: LayoutDashboard, name: "Início", url: "/" },
  { icon: HandCoins, name: "Receitas", url: "/receitas" },
];

const RIGHT: { icon: LucideIcon; name: string; url: string }[] = [
  { icon: BanknoteArrowDown, name: "Despesas", url: "/despesas" },
  { icon: PiggyBank, name: "Metas", url: "/investimentos" },
];

function NavLink({ icon: Icon, name, url }: { icon: LucideIcon; name: string; url: string }) {
  const pathname = usePathname();
  const isActive = url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Link
      href={url}
      aria-current={isActive ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
        isActive ? "text-brand-500" : "text-slate-400"
      }`}
    >
      <Icon size={20} />
      {name}
    </Link>
  );
}

/**
 * Navegação inferior do celular, com o botão de lançar no centro — a posição
 * mais fácil de alcançar com o polegar, que é onde a ação mais repetida do app
 * deve estar.
 */
export function BottomNav() {
  const { openTransaction } = useTransactions();

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-center">
        {LEFT.map((item) => (
          <NavLink key={item.url} {...item} />
        ))}

        <div className="flex flex-1 justify-center">
          <button
            onClick={() => openTransaction()}
            aria-label="Novo lançamento"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-400 text-white shadow-lg shadow-brand-400/40 transition active:scale-95 cursor-pointer"
          >
            <Plus size={26} />
          </button>
        </div>

        {RIGHT.map((item) => (
          <NavLink key={item.url} {...item} />
        ))}
      </div>
    </nav>
  );
}
