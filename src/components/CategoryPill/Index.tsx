import { CategoryIcon } from "../CategoryIcon/Index";
import type { Category } from "@/src/lib/categories";

type CategoryPillProps = {
  category: Category;
  size?: "sm" | "md";
};

/**
 * Pílula da categoria com ícone e a cor da própria categoria.
 *
 * Substitui a pílula cinza genérica que exibia o valor cru do banco
 * ("alimentacao") em vez do rótulo.
 */
export function CategoryPill({ category, size = "sm" }: CategoryPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ backgroundColor: `${category.color}1a`, color: category.color }}
    >
      <CategoryIcon icon={category.icon} size={size === "sm" ? 11 : 13} />
      {category.label}
    </span>
  );
}
