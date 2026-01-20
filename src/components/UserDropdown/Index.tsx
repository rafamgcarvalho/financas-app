/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("name") || "Usuário";
    }
    return "Usuário";
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          group flex items-center gap-3 rounded-full border border-gray-200
          bg-white px-2 py-1.5 shadow-sm
          transition-all duration-200
          hover:shadow-md hover:border-gray-300
          active:scale-[0.97] cursor-pointer
        "
      >
        {/* Avatar */}
        <div className="
          flex h-9 w-9 items-center justify-center rounded-full
          bg-linear-to-br from-teal-400 to-teal-600
          text-sm font-bold uppercase text-white
          shadow-inner
        ">
          {username.charAt(0)}
        </div>

        {/* Nome */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-semibold text-gray-700 leading-none">
            @{username}
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-teal-600">
            Conta ativa
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`
            ml-1 text-gray-400 transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="
          absolute right-0 z-50 mt-2 w-56
          rounded-2xl border border-gray-100 bg-white
          shadow-xl
          animate-in fade-in zoom-in duration-150
          origin-top-right
        ">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Conta
            </p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">
              @{username}
            </p>
          </div>

          {/* Itens */}
          <div className="py-2">
            <button className="
              flex w-full items-center gap-3 px-4 py-2.5
              text-sm text-gray-600
              hover:bg-gray-50 transition-colors cursor-pointer
            ">
              <User size={18} className="text-gray-400" />
              Meu Perfil
            </button>

            <button className="
              flex w-full items-center gap-3 px-4 py-2.5
              text-sm text-gray-600
              hover:bg-gray-50 transition-colors cursor-pointer
            ">
              <Settings size={18} className="text-gray-400" />
              Configurações
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 p-2">
            <button
              onClick={handleLogout}
              className="
                flex w-full items-center gap-3 rounded-lg
                px-3 py-2.5 text-sm font-medium text-red-500
                hover:bg-red-50 transition-colors cursor-pointer
              "
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
