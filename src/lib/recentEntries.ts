import { readStorage, writeStorage } from "./storage";
import type { CategoryKind } from "./categories";

/**
 * Lançamentos frequentes.
 *
 * Guarda os últimos lançamentos de cada tipo para oferecê-los como atalho no
 * formulário ("Aluguel R$ 1.200" em um clique) e para lembrar qual categoria o
 * usuário costuma usar para cada nome — evitando que a categoria caia
 * silenciosamente na primeira da lista.
 */

export type RecentEntry = {
  title: string;
  amount: number;
  category: string;
  type: CategoryKind;
  /** Quantas vezes esse lançamento já foi feito — ordena os atalhos. */
  count: number;
};

const KEY = "recent-entries:v1";
const MAX_ENTRIES = 40;
const MAX_SUGGESTIONS = 6;

function normalize(title: string): string {
  return title.trim().toLowerCase();
}

export function getRecentEntries(): RecentEntry[] {
  return readStorage<RecentEntry[]>(KEY, []);
}

export function rememberEntry(entry: Omit<RecentEntry, "count">): void {
  const entries = getRecentEntries();
  const key = normalize(entry.title);
  const existing = entries.find((e) => normalize(e.title) === key && e.type === entry.type);

  const next = existing
    ? [
        { ...existing, amount: entry.amount, category: entry.category, count: existing.count + 1 },
        ...entries.filter((e) => e !== existing),
      ]
    : [{ ...entry, count: 1 }, ...entries];

  writeStorage(KEY, next.slice(0, MAX_ENTRIES));
}

/** Atalhos sugeridos para um tipo, os mais usados primeiro. */
export function getSuggestions(type: CategoryKind): RecentEntry[] {
  return getRecentEntries()
    .filter((e) => e.type === type)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SUGGESTIONS);
}

/** Categoria que o usuário costuma usar para esse nome, se houver. */
export function categoryForTitle(title: string, type: CategoryKind): string | undefined {
  if (!title.trim()) return undefined;

  const key = normalize(title);
  const match = getRecentEntries().find((e) => e.type === type && normalize(e.title) === key);

  return match?.category;
}
