/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UserModel } from "@/src/models/UserModel";
import { api } from "@/src/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const initialFormState: UserModel = {
        name: "",
        email: "",
        password: "",
    }

    const [formData, setFormData] = useState<UserModel>(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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
            const message = error.message || "Erro ao realizar cadastro";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Finanças App
        </h2>

        {/* onSubmit={handleLogin} */}
        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              name="name"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
              placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              name="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#42B7B2] focus:border-transparent outline-none"
              placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              name="password"
              placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#42B7B2] text-white font-bold rounded-md hover:bg-teal-600 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
