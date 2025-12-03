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

    const bgClasses = `hover:bg-[#42B7B2] transition-colors duration-200 ease-in-out ${isActive ? "bg-[#42B7B2] text-white" : "text-gray-300 hover:bg-white/10"}`;

    const layoutClasses = "flex items-center justify-center gap-3 p-3 text-base sm:gap-4 sm:p-4 sm:text-lg md:gap-5 md:p-5 md:justify-start lg:gap-6 lg:p-6 lg:text-xl";

    return (
    <Link
      className={`${bgClasses} ${layoutClasses}`}
      href={url}
    >
      <Icon size={20} />
      <span className="hidden md:block">{name}</span>
    </Link>
  );
}