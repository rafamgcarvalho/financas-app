/**
 * Datas do app.
 *
 * O backend guarda ISO em UTC. Para não perder um dia por fuso, gravamos sempre
 * ao meio-dia local e exibimos com timeZone UTC.
 */

/** "2026-08-25" a partir de uma data local (não usa toISOString, que desloca o fuso). */
export function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayInput(): string {
  return toInputDate(new Date());
}

export function yesterdayInput(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toInputDate(d);
}

/** "2026-08-25" -> ISO em UTC, ancorado ao meio-dia para sobreviver ao fuso. */
export function inputDateToISO(input: string): string {
  return new Date(`${input}T12:00:00`).toISOString();
}

/** ISO do backend -> "2026-08-25" para o input date. */
export function isoToInputDate(iso: string): string {
  return iso.split("T")[0];
}

export function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatMonthLabel(month: number, year: number): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 15));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Mês anterior a um par mês/ano (1-indexado). */
export function previousMonth(month: number, year: number): { month: number; year: number } {
  return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
}

/** Fração do mês já percorrida — usada para projetar o fechamento. */
export function monthProgress(month: number, year: number): number {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  if (!isCurrentMonth) {
    const isPast = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
    return isPast ? 1 : 0;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return now.getDate() / daysInMonth;
}
