import type { Metadata } from "next";
import "./globals.css";
import { ToastifyContainer } from "../components/ToastifyContainer/Index";

export const metadata: Metadata = {
  title: "Finanças App",
  description: "Gerenciador financeiro pessoal",
};

export default function RootLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-gray-50">
        <ToastifyContainer />
        {children}
      </body>
    </html>
  );
}