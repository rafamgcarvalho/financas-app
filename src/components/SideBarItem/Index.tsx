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
  const isActive = url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Link
      href={url}
      aria-current={isActive ? "page" : undefined}
      title={name}
      className={`group flex items-center justify-center gap-4 rounded-xl px-4 py-3 transition-all lg:justify-start ${
        isActive ? "bg-brand-400 text-white shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        size={22}
        className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
      />
      <span className="hidden text-[15px] font-medium lg:block">{name}</span>
    </Link>
  );
}
