"use client";

import { useCallback, useSyncExternalStore } from "react";
import { scopedKey } from "@/src/lib/storage";

/**
 * Lê preferências do localStorage como fonte externa de dados.
 *
 * `useSyncExternalStore` é o caminho certo aqui: nada de `setState` dentro de
 * efeito, e a hidratação funciona — o servidor renderiza o valor padrão e o
 * cliente troca pelo valor salvo assim que assume a página.
 */

// O snapshot precisa manter a identidade entre renders, senão o React entra em
// loop. Guardamos o JSON cru junto do valor e só reparseamos quando ele muda.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(callback: () => void): () => void {
  window.addEventListener("financas:storage", callback);
  // "storage" cobre a edição feita em outra aba.
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("financas:storage", callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLocalStore<T>(key: string, fallback: T): T {
  const getSnapshot = useCallback((): T => {
    const fullKey = scopedKey(key);
    const raw = localStorage.getItem(fullKey);

    const cached = cache.get(fullKey);
    if (cached && cached.raw === raw) return cached.value as T;

    let value = fallback;
    if (raw) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = fallback;
      }
    }

    cache.set(fullKey, { raw, value });
    return value;
  }, [key, fallback]);

  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Mesma ideia para valores simples gravados fora do namespace (token, nome). */
export function useLocalValue(key: string, fallback: string | null = null): string | null {
  const getSnapshot = useCallback(() => localStorage.getItem(key) ?? fallback, [key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
