import { Container } from "../Container/Index";
import { MonthSelector } from "../MonthSelector/Index";

export function DashboardContent() {
    return (
        <Container>
            {/* 1. Cabeçalho da Página */}
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Resumo do Dashboard
            </h1>

            <MonthSelector />

            {/* 2. Área de Cartões/Estatísticas */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-8">
                {/* Card 1: Receitas */}
                <div className="bg-blue-100 p-5 rounded-lg shadow-xl">
                    <p className="text-sm text-blue-600">Receitas Totais</p>
                    <p className="text-2xl font-semibold text-blue-800">R$ 5.400,00</p>
                </div>

                {/* Card 2: Despesas */}
                <div className="bg-red-100 p-5 rounded-lg shadow-xl">
                    <p className="text-sm text-red-600">Despesas Totais</p>
                    <p className="text-2xl font-semibold text-red-800">R$ 1.200,00</p>
                </div>

                {/* Card 3: Investimento */}
                <div className="bg-slate-200 p-5 rounded-lg shadow-xl">
                    <p className="text-sm text-slate-600">Investimentos Totais</p>
                    <p className="text-2xl font-semibold text-slate-800">R$ 4.200,00</p>
                </div>

                {/* Card 4: Balanço */}
                <div className="bg-green-100 p-5 rounded-lg shadow-xl">
                    <p className="text-sm text-green-600">Balanço</p>
                    <p className="text-2xl font-semibold text-green-800">R$ 4.200,00</p>
                </div>
            </div>

            {/* 3. Área de Gráficos/Tabelas */}
            <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Fluxo de Caixa Mensal</h2>
                <div className="h-64 flex items-center justify-center text-gray-400">
                    [Placeholder para Gráfico ou Tabela]
                </div>
            </div>
        </Container>
    );
}