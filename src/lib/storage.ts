/**
 * Acesso a localStorage isolado por usuário logado.
 *
 * Preferências (categorias, orçamentos, favoritos) não devem vazar de uma conta
 * para outra quando duas pessoas usam o mesmo navegador, então toda chave é
 * prefixada com o username salvo no login.
 */

const NAMESPACE = "financas";

function currentUser(): string {
  if (typeof window === "undefined") return "anon";
  return localStorage.getItem("username") || localStorage.getItem("name") || "anon";
}

export function scopedKey(key: string): string {
  return `${NAMESPACE}:${currentUser()}:${key}`;
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(scopedKey(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(scopedKey(key), JSON.stringify(value));
    // Permite que outros componentes da mesma aba reajam à mudança.
    window.dispatchEvent(new CustomEvent("financas:storage", { detail: { key } }));
  } catch {
    // Quota cheia ou modo privativo — preferências são descartáveis.
  }
}
