/**
 * Helpers do campo de valor.
 *
 * O input de moeda guarda apenas dígitos (centavos) no estado e exibe a versão
 * formatada. Isso evita o `type="number"` — que no celular abre o teclado
 * errado e obriga o usuário a digitar ponto em vez de vírgula.
 */

const MAX_DIGITS = 12; // até R$ 9.999.999.999,99

/** Mantém somente os dígitos digitados, limitando o tamanho. */
export function toDigits(input: string): string {
  return input.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
}

/** "12345" -> "123,45" (sem o prefixo R$, que fica fixo ao lado do input). */
export function formatDigits(digits: string): string {
  if (!digits) return "";

  const cents = Number(digits);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "12345" -> 123.45 */
export function digitsToNumber(digits: string): number {
  if (!digits) return 0;
  return Number(digits) / 100;
}

/** 123.45 -> "12345" (usado ao abrir o formulário em modo edição). */
export function numberToDigits(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n) || n <= 0) return "";
  return String(Math.round(n * 100));
}

export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (abs >= 1_000) return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")}k`;

  return `R$ ${value.toFixed(0)}`;
}

/**
 * Variação percentual entre dois períodos.
 * Retorna null quando não há base de comparação (mês anterior zerado).
 */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
