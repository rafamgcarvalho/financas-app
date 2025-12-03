"use client";

import React, { useState, useMemo } from 'react';

// Função para gerar a lista dos últimos 12 meses
function generateLast12Months() {
    const months = [];
    const now = new Date();
    
    // Iteramos 12 vezes para os últimos 12 meses
    for (let i = 0; i < 12; i++) {
        // Criamos uma nova data para o mês que queremos
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        
        // Formatamos o nome e o ano (ex: "Março/2025")
        const label = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: 'long' })
            .format(date);
            
        // Formatamos o valor (ex: "2025-03")
        const value = date.toISOString().slice(0, 7); 

        months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    // Invertemos a ordem para mostrar o mês mais antigo primeiro (opcional)
    return months.reverse(); 
}

export function MonthSelector() {
    // Usamos useMemo para gerar a lista apenas uma vez, otimizando o desempenho
    const months = useMemo(() => generateLast12Months(), []);
    
    // O mês padrão será o mês mais recente da lista gerada
    const defaultMonth = months[months.length - 1]?.value || '';
    
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth); 

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(event.target.value);
        console.log("Mês selecionado:", event.target.value);
    };

    return (
        <div className="flex items-center space-x-4 mb-8">
            <select
                id="month-select"
                value={selectedMonth}
                onChange={handleChange}
                className="block w-48 py-2 px-3 border border-gray-300 bg-white rounded-md 
                           shadow-sm focus:outline-none focus:ring-[#42B7B2] focus:border-[#42B7B2] 
                           sm:text-sm transition duration-150 ease-in-out"
            >
                {months.map((month) => (
                    <option key={month.value} value={month.value}>
                        {month.label}
                    </option>
                ))}
            </select>
        </div>
    );
}