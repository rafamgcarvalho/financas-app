type SummaryCardProps = {
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'investment' | 'balance';
}

const styles = {
    income: {
        card: "bg-blue-100 p-5 rounded-lg shadow-xl",
        titleText: "text-sm text-blue-600",
        valueText: "text-2xl font-semibold text-blue-800",
    },
    expense: {
        card: "bg-red-100 p-5 rounded-lg shadow-xl",
        titleText: "text-sm text-red-600",
        valueText: "text-2xl font-semibold text-red-800",
    },
    investment: {
        card: "bg-slate-200 p-5 rounded-lg shadow-xl",
        titleText: "text-sm text-slate-600",
        valueText: "text-2xl font-semibold text-slate-800",
    },
    balance: {
        card: "bg-green-100 p-5 rounded-lg shadow-xl",
        titleText: "text-sm text-green-600",
        valueText: "text-2xl font-semibold text-green-800",
    }
};

export function SummaryCard({ title, amount, type }: SummaryCardProps) {
    const currentStyle = styles[type];

    return (
        <div className={currentStyle.card}>
            <p className={currentStyle.titleText}>{title}</p>
            <p className={currentStyle.valueText}>{amount}</p>
        </div>
    )
}