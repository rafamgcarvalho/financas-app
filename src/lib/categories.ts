import {
  Home,
  UtensilsCrossed,
  Car,
  ReceiptText,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Briefcase,
  Laptop,
  Gift,
  PiggyBank,
  TrendingUp,
  Landmark,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { readStorage, writeStorage } from "./storage";

export type CategoryKind = "income" | "expense" | "investment";

export type Category = {
  value: string;
  label: string;
  /** Cor usada em gráficos e na pílula da categoria. */
  color: string;
  icon: string;
  kind: CategoryKind;
  custom?: boolean;
};

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  food: UtensilsCrossed,
  car: Car,
  bill: ReceiptText,
  health: HeartPulse,
  education: GraduationCap,
  leisure: Gamepad2,
  shopping: ShoppingBag,
  salary: Briefcase,
  freelance: Laptop,
  gift: Gift,
  savings: PiggyBank,
  stocks: TrendingUp,
  bank: Landmark,
  tag: Tag,
};

export function categoryIcon(icon?: string): LucideIcon {
  return ICONS[icon ?? "tag"] ?? Tag;
}

export const ICON_OPTIONS = Object.keys(ICONS);

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { value: "moradia", label: "Moradia", color: "#6366f1", icon: "home", kind: "expense" },
  { value: "alimentacao", label: "Alimentação", color: "#f97316", icon: "food", kind: "expense" },
  { value: "transporte", label: "Transporte", color: "#0ea5e9", icon: "car", kind: "expense" },
  { value: "assinaturas", label: "Contas/Assinaturas", color: "#8b5cf6", icon: "bill", kind: "expense" },
  { value: "saude", label: "Saúde", color: "#ec4899", icon: "health", kind: "expense" },
  { value: "educacao", label: "Educação", color: "#14b8a6", icon: "education", kind: "expense" },
  { value: "lazer", label: "Lazer", color: "#eab308", icon: "leisure", kind: "expense" },
  { value: "compras", label: "Compras", color: "#f43f5e", icon: "shopping", kind: "expense" },
  { value: "outros", label: "Outros", color: "#94a3b8", icon: "tag", kind: "expense" },

  // Receitas
  { value: "salario", label: "Salário", color: "#10b981", icon: "salary", kind: "income" },
  { value: "freelance", label: "Freelance", color: "#22c55e", icon: "freelance", kind: "income" },
  { value: "rendimentos", label: "Rendimentos", color: "#84cc16", icon: "stocks", kind: "income" },
  { value: "presente", label: "Presente", color: "#a3e635", icon: "gift", kind: "income" },
  { value: "outros_receita", label: "Outros", color: "#94a3b8", icon: "tag", kind: "income" },

  // Investimentos
  { value: "reserva", label: "Reserva de emergência", color: "#2ba09b", icon: "savings", kind: "investment" },
  { value: "renda_fixa", label: "Renda fixa", color: "#1f807d", icon: "bank", kind: "investment" },
  { value: "renda_variavel", label: "Renda variável", color: "#42b7b2", icon: "stocks", kind: "investment" },
  { value: "outros_investimento", label: "Outros", color: "#94a3b8", icon: "tag", kind: "investment" },
];

export const CUSTOM_CATEGORIES_KEY = "categories:custom";
export const HIDDEN_CATEGORIES_KEY = "categories:hidden";

export function getCustomCategories(): Category[] {
  return readStorage<Category[]>(CUSTOM_CATEGORIES_KEY, []).map((c) => ({ ...c, custom: true }));
}

export function getHiddenCategories(): string[] {
  return readStorage<string[]>(HIDDEN_CATEGORIES_KEY, []);
}

/** Categorias visíveis, opcionalmente filtradas por tipo de transação. */
export function getCategories(kind?: CategoryKind): Category[] {
  const hidden = new Set(getHiddenCategories());
  const all = [...DEFAULT_CATEGORIES, ...getCustomCategories()];

  return all
    .filter((c) => !hidden.has(c.value))
    .filter((c) => (kind ? c.kind === kind : true));
}

export function addCategory(category: Omit<Category, "custom">): void {
  const custom = getCustomCategories();
  writeStorage(CUSTOM_CATEGORIES_KEY, [...custom, { ...category, custom: true }]);
}

export function updateCategory(value: string, patch: Partial<Category>): void {
  const custom = getCustomCategories();
  writeStorage(
    CUSTOM_CATEGORIES_KEY,
    custom.map((c) => (c.value === value ? { ...c, ...patch } : c)),
  );
}

/**
 * Remove uma categoria da lista. Padrões não são apagados — apenas ocultados,
 * para que transações antigas continuem exibindo o rótulo correto.
 */
export function removeCategory(value: string): void {
  const custom = getCustomCategories();
  const isCustom = custom.some((c) => c.value === value);

  if (isCustom) {
    writeStorage(
      CUSTOM_CATEGORIES_KEY,
      custom.filter((c) => c.value !== value),
    );
    return;
  }

  const hidden = getHiddenCategories();
  if (!hidden.includes(value)) writeStorage(HIDDEN_CATEGORIES_KEY, [...hidden, value]);
}

export function restoreCategory(value: string): void {
  writeStorage(
    HIDDEN_CATEGORIES_KEY,
    getHiddenCategories().filter((v) => v !== value),
  );
}

/**
 * Resolve uma categoria pelo valor gravado na transação, inclusive quando ela
 * foi ocultada ou removida do cadastro.
 */
export function findCategory(value?: string): Category {
  if (!value) return { value: "outros", label: "Sem categoria", color: "#94a3b8", icon: "tag", kind: "expense" };

  const found = [...DEFAULT_CATEGORIES, ...getCustomCategories()].find((c) => c.value === value);
  if (found) return found;

  return {
    value,
    label: value.replace(/_/g, " "),
    color: "#94a3b8",
    icon: "tag",
    kind: "expense",
  };
}

export function categoryLabel(value?: string): string {
  return findCategory(value).label;
}

export function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
