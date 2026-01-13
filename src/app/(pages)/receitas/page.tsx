"use client";

import { toast } from "react-toastify";

import { Container } from "@/src/components/Container/Index";
import { IncomeModel } from "@/src/models/IncomeModel";
import { useState } from "react";
import { api } from "@/src/services/api";
import { useRouter } from "next/navigation";

const categories = [
    { value: "salario", label: "Salário" },
    { value: "investimento", label: "Investimento" },
    { value: "freelance", label: "Freelance" },
    { value: "outros", label: "Outros" },
];

export default function ReceitasPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<IncomeModel>({
        name: "",
        description: "",
        amount: "",
        incomeDate: "",
        category: "salario",
        recurring: false,
    });

    // const [validationErrors, setValidationErrors] = useState<Partial<IncomeModel>>({
    //     name: "Nome inválido",
    //     amount: "Valor inválido",
    //     incomeDate: "Data inválida",
    // });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));

        // console.log(`Campo ${name} atualizado para: ${value}`);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: checked,
        }));

        // console.log("Checkbox mudou");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const amountNumber = Number(formData.amount);
        const errors = [];

        if (!formData.name) errors.push("Nome inválido");
        if (!formData.amount || isNaN(amountNumber) || amountNumber < 0) errors.push("Valor inválido");
        if (!formData.incomeDate) errors.push("Data inválida");

        if (errors.length > 0) {
            toast.dismiss();
            errors.forEach(error => toast.error(error));
            return;
        }

        try {
            const payload = {
                title: formData.name,
                amount: amountNumber,
                description: formData.description,
                date: formData.incomeDate,
                category: formData.category,
                type: 'INCOME'
            };

            await api.post('/transactions', payload);
            
            toast.success("Receita salva com sucesso!");
            
            router.push('/'); 
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <Container>
            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Adicionar Nova Receita
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="nome"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nome
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Ex: Salário Mensal"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="valor"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                placeholder="0.00"
                                step="0.01"
                                required
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="descricao"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Detalhes sobre a origem da receita..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label
                                htmlFor="data"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Data
                            </label>
                            <input
                                type="date"
                                id="incomeDate"
                                name="incomeDate"
                                required
                                value={formData.incomeDate}
                                onChange={handleChange}
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Categoria
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="recurring"
                                name="recurring"
                                type="checkbox"
                                checked={formData.recurring}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-[#42B7B2] border-gray-300 rounded focus:ring-[#42B7B2]"
                            />
                            <label
                                htmlFor="recurring"
                                className="ml-2 block text-sm font-medium text-gray-700"
                            >
                                É Recorrente (Mensal)
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#42B7B2] hover:bg-teal-600 hover:cursor-pointer transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42B7B2]"
                        >
                            Salvar Receita
                        </button>
                    </div>
                </form>
            </div>
        </Container>
    );
}
