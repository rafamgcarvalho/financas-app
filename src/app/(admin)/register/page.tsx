/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UserModel } from "@/src/models/UserModel";
import { api } from "@/src/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const initialFormState: UserModel = {
    name: "",
    username: "",
    password: "",
  };

  const [formData, setFormData] = useState<UserModel>(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let finalValue = value;

    if (name === "username") {
      finalValue = value.replace(/\s/g, "").toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users", formData);

      toast.success("Usuário cadastrado com sucesso!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
      {/* 🔵 Shape 1 */}
      <div
        className="absolute w-[500px] h-[500px] bg-teal-600 rounded-full blur-3xl opacity-30"
        style={{
          top: "-150px",
          left: "-150px",
          animation: "float1 28s ease-in-out infinite",
        }}
      />

      {/* 🔵 Shape 2 */}
      <div
        className="absolute w-[450px] h-[450px] bg-blue-600 rounded-full blur-3xl opacity-25"
        style={{
          bottom: "-150px",
          right: "-150px",
          animation: "float2 32s ease-in-out infinite",
        }}
      />

      {/* 🔵 Shape 3 */}
      <div
        className="absolute w-[400px] h-[400px] bg-teal-300 rounded-full blur-3xl opacity-20"
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

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              name="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 bg-white/90 focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              name="username"
              placeholder="Seu usuário"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 bg-white/90 focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
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
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pr-12 rounded-xl border border-gray-300 bg-white/90 focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-teal-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#42B7B2] text-white font-semibold transition hover:bg-teal-600 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-[#42B7B2] font-medium hover:underline"
          >
            Entrar
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
