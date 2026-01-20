"use client";

import { BanknoteArrowDown, Goal, HandCoins, PiggyBank} from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { SidebarItem } from "../SideBarItem/Index";

export function SideBar() {
    return (
        <div className="h-screen bg-[#22324B] text-white font-extrabold flex flex-col pt-6 w-20 md:w-56 lg:w-80">
            <div className="flex justify-center">
                <Goal className="w-16 h-16 text-[#42B7B2]" />
            </div>

            <nav className="flex flex-col mt-10">
                <SidebarItem icon={LayoutDashboard} name="Dashboard" url="/"></SidebarItem>
                <SidebarItem icon={HandCoins} name="Receitas" url="/receitas"></SidebarItem>
                <SidebarItem icon={BanknoteArrowDown} name="Despesas" url="/despesas"></SidebarItem>
                <SidebarItem icon={PiggyBank} name="Investimentos" url="/investimentos"></SidebarItem>
            </nav>
        </div>
    )
}