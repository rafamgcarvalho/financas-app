import { TransactionsPageView } from "@/src/components/TransactionsPageView/Index";

export default function DespesasPage() {
  return (
    <TransactionsPageView
      type="expense"
      title="Despesas"
      subtitle="Controle seus gastos e descubra para onde o dinheiro vai"
    />
  );
}
