"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { useLocalValue } from "@/src/hooks/useLocalStore";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fonte externa: o servidor renderiza o rótulo padrão e o cliente troca pelo
  // nome salvo assim que assume a página.
  const username = useLocalValue("name", "Usuário") ?? "Usuário";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="group flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.97] cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-sm font-bold uppercase text-white">
          {username.charAt(0)}
        </div>

        <span className="hidden text-sm font-semibold text-navy-800 sm:block">{username}</span>

        <ChevronDown
          size={15}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl animate-scale-in"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Conta</p>
            <p className="mt-0.5 truncate text-sm font-medium text-navy-800">{username}</p>
          </div>

          <div className="py-2">
            <Link
              href="/configuracoes"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Settings size={17} className="text-slate-400" />
              Configurações
            </Link>
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-expense-600 transition-colors hover:bg-expense-50 cursor-pointer"
            >
              <LogOut size={17} />
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
