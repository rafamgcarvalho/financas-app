"use client";

import { Container } from "@/src/components/Container/Index";
import React, { useState } from 'react';

// Tipos de categoria
const categories = [
    { value: 'salario', label: 'Salário' },
    { value: 'investimento', label: 'Investimento' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'outros', label: 'Outros' },
];

export default function DespesasPage() {
     const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        valor: '',
        data: '',
        categoria: categories[0].value,
        recorrente: false,
    });

    // Event handler unificado para input, select e textarea
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        
        // Faz o casting para HTMLInputElement para acessar a propriedade 'checked' com segurança
        const target = e.target as HTMLInputElement; 
        const checked = target.checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Receita Enviada:", formData);
        // LÓGICA FUTURA: Chamar API
    };

    return (
        <Container>
            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Nova Despesa</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* GRUPO DE INPUTS: Nome e Valor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Campo NOME */}
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                                Nome
                            </label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Ex: Salário Mensal"
                                required
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            />
                        </div>

                        <div>
                            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                                Valor (R$)
                            </label>
                            <input
                                type="number"
                                id="valor"
                                name="valor"
                                value={formData.valor}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Detalhes sobre a origem da receita..."
                            className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        
                        {/* Campo DATA */}
                        <div>
                            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                                Data
                            </label>
                            <input
                                type="date"
                                id="data"
                                name="data"
                                value={formData.data}
                                onChange={handleChange}
                                required
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            />
                        </div>

                        <div>
                            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                                Categoria
                            </label>
                            <select
                                id="categoria"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className="w-full border-gray-300 focus:border-[#42B7B2] focus:ring-[#42B7B2] rounded-md shadow-sm p-3 border"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="recorrente"
                                name="recorrente"
                                type="checkbox"
                                checked={formData.recorrente}
                                onChange={handleChange}
                                className="h-4 w-4 text-[#42B7B2] border-gray-300 rounded focus:ring-[#42B7B2]"
                            />
                            <label htmlFor="recorrente" className="ml-2 block text-sm font-medium text-gray-700">
                                É Recorrente (Mensal)
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#42B7B2] hover:bg-teal-600 hover:bg-opacity-90 hover:cursor-pointer transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42B7B2]"
                        >
                            Salvar Receita
                        </button>
                    </div>

                </form>
            </div>
        </Container>
    );
}