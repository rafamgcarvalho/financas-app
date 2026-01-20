"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inicialização segura do estado (Lazy Initialization)
  // Isso evita o erro de "cascading renders" e funciona com SSR
  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("username") || "Usuário";
    }
    return "Usuário";
  });

  // Fecha o menu se o usuário clicar em qualquer lugar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-4 bg-white rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 group cursor-pointer"
      >
        {/* Avatar com a Inicial */}
        <div className="w-9 h-9 bg-[#42B7B2] rounded-full flex items-center justify-center text-white font-bold shadow-inner uppercase transition-colors group-hover:bg-teal-600">
          {username.charAt(0)}
        </div>

        {/* Nome e Status */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-bold text-gray-700 leading-none">
            @{username}
          </span>
          <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider mt-1">
            Conta Ativa
          </span>
        </div>

        {/* Ícone de Seta */}
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-150 origin-top-right">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Gerenciar Conta</p>
          </div>

          <button className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer">
            <User size={18} className="text-gray-400" /> 
            Meu Perfil
          </button>

          <button className="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer">
            <Settings size={18} className="text-gray-400" /> 
            Configurações
          </button>

          <div className="border-t border-gray-50 mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors cursor-pointer"
            >
              <LogOut size={18} /> 
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}