/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/src/services/api";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.post<{ access_token: string }>("/auth/login", { username, password });
      const response = await api.get<{ name: string }>(`/users/${username}`);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("name", response.name);
      // O username identifica as preferências locais (categorias, orçamentos)
      // para que duas contas no mesmo navegador não se misturem.
      localStorage.setItem("username", username);
      toast.success("Login realizado com sucesso!");

      // Sessão expirada guarda a página de origem em ?from= — voltamos para ela
      // em vez de sempre despejar o usuário no dashboard.
      const from = new URLSearchParams(window.location.search).get("from");
      router.push(from?.startsWith("/") ? from : "/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-canvas">
      {/* 🔵 Shape 1 */}
      <div
        className="absolute w-[500px] h-[500px] bg-brand-500 rounded-full blur-3xl opacity-30"
        style={{
          top: "-150px",
          left: "-150px",
          animation: "float1 28s ease-in-out infinite",
        }}
      />

      {/* 🔵 Shape 2 */}
      <div
        className="absolute w-[450px] h-[450px] bg-navy-600 rounded-full blur-3xl opacity-25"
        style={{
          bottom: "-150px",
          right: "-150px",
          animation: "float2 32s ease-in-out infinite",
        }}
      />

      {/* 🔵 Shape 3 */}
      <div
        className="absolute w-[400px] h-[400px] bg-brand-300 rounded-full blur-3xl opacity-20"
        style={{
          top: "40%",
          right: "-200px",
          animation: "float3 26s ease-in-out infinite",
        }}
      />

      {/* 🧊 Card */}
      <div className="relative z-10 max-w-md w-full p-8 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Finanças App
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl border border-gray-300 bg-white/90 focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
              placeholder="Seu usuário"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.replace(/\s/g, "").toLowerCase())
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-3 pr-12 rounded-xl border border-gray-300 bg-white/90 focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-brand-500 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-400 text-white font-semibold transition hover:bg-brand-500 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-brand-500 font-medium hover:underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>

      {/* 🎞️ Keyframes */}
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.06); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.04); }
        }
      `}</style>
    </div>
  );
}
