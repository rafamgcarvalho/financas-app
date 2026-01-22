export type TransactionModel = {
    name: string;
    description: string;
    amount: string;
    transactionDate: string;
    category: string;
    recurring: boolean;
    type: 'income' | 'expense' | 'investment';
    installments?: string | number;
}