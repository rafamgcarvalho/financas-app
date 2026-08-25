import { createElement } from "react";
import { categoryIcon } from "@/src/lib/categories";

type CategoryIconProps = {
  icon?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renderiza o ícone de uma categoria a partir do nome salvo.
 *
 * Usa `createElement` em vez de atribuir o componente a uma variável no meio do
 * render, que é o padrão que o lint do React desencoraja.
 */
export function CategoryIcon({ icon, size = 14, className, style }: CategoryIconProps) {
  return createElement(categoryIcon(icon), { size, className, style });
}
