import { SideBar } from "../../components/SideBar/Index";

export default function DashboardLayout({ children, }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}