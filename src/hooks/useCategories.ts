"use client";

import { useMemo } from "react";
import { useLocalStore } from "./useLocalStore";
import {
  CUSTOM_CATEGORIES_KEY,
  DEFAULT_CATEGORIES,
  HIDDEN_CATEGORIES_KEY,
  type Category,
  type CategoryKind,
} from "@/src/lib/categories";

// Constantes de módulo: um literal novo a cada render invalidaria o snapshot.
const NO_CUSTOM: Category[] = [];
const NO_HIDDEN: string[] = [];

/**
 * Categorias visíveis, opcionalmente filtradas por tipo.
 *
 * No servidor e no primeiro render devolve só os padrões; as customizações do
 * usuário entram assim que o cliente assume.
 */
export function useCategories(kind?: CategoryKind) {
  const custom = useLocalStore<Category[]>(CUSTOM_CATEGORIES_KEY, NO_CUSTOM);
  const hidden = useLocalStore<string[]>(HIDDEN_CATEGORIES_KEY, NO_HIDDEN);

  const categories = useMemo(() => {
    const hiddenSet = new Set(hidden);

    return [...DEFAULT_CATEGORIES, ...custom.map((c) => ({ ...c, custom: true }))]
      .filter((category) => !hiddenSet.has(category.value))
      .filter((category) => (kind ? category.kind === kind : true));
  }, [custom, hidden, kind]);

  return { categories, custom, hidden };
}
