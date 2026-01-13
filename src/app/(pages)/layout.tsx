"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SideBar } from "../../components/SideBar/Index";

export default function DashboardLayout({ children, }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}