/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/src/services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.post("/auth/login", { username, password });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", username);
      toast.success("Login realizado com sucesso!");

      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-100">
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
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
              placeholder="Nome de usuário"
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
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#42B7B2] text-white font-bold rounded-md hover:bg-teal-600 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="m-6 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-[#42B7B2] font-medium hover:underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
