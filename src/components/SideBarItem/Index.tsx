"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItemProps = {
  icon: LucideIcon;
  name: string;
  url: string;
};

export function SidebarItem({ icon: Icon, name, url }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === url;

  return (
    <Link
      href={url}
      className={`
        group flex items-center gap-4
        px-4 py-3
        rounded-xl transition-all
        ${isActive
          ? "bg-[#42B7B2] text-white shadow-md"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      {/* Ícone */}
      <Icon
        size={22}
        className={`
          transition-colors
          ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}
        `}
      />

      {/* Texto */}
      <span className="hidden md:block text-[15px] font-medium">
        {name}
      </span>
    </Link>
  );
}

