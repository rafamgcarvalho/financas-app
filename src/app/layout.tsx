import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastifyContainer } from "../components/ToastifyContainer/Index";

export const metadata: Metadata = {
  title: "Finanças App",
  description: "Gerenciador financeiro pessoal",
  manifest: "/manifest.json",
  applicationName: "Finance",
  appleWebApp: {
    capable: true,
    title: "Finance",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#22324b",
  // Evita o zoom automático do iOS ao focar um input.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full antialiased">
        <ToastifyContainer />
        {children}
      </body>
    </html>
  );
}
