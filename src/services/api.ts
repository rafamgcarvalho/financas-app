const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Rotas que não exigem sessão — um 401 nelas é erro de credencial, não expiração. */
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register", "/users/login", "/users/register"];

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Sessão expirada: limpa o token e manda para o login preservando a página
 * atual, para voltar ao mesmo lugar depois de reautenticar.
 *
 * Antes disso, um token vencido virava um toast genérico e o usuário ficava
 * preso numa tela vazia.
 */
function handleUnauthorized() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");

  if (window.location.pathname.startsWith("/login")) return;

  const from = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.replace(`/login?from=${from}`);
}

async function request<T>(endpoint: string, init: RequestInit, fallbackMessage: string): Promise<T> {
  const token = getAuthToken();
  const isPublic = PUBLIC_ENDPOINTS.some((route) => endpoint.startsWith(route));

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, { ...init, headers });
  } catch {
    // fetch só rejeita por falha de rede — a API fora do ar cai aqui.
    throw new ApiError("Não foi possível conectar ao servidor. Verifique sua conexão.", 0);
  }

  if (!response.ok) {
    if (response.status === 401 && !isPublic) {
      handleUnauthorized();
      throw new ApiError("Sua sessão expirou. Faça login novamente.", 401);
    }

    // Um erro 500 costuma devolver HTML, não JSON — não deixar o parse estourar.
    const data = await response.json().catch(() => null);
    throw new ApiError(data?.message || fallbackMessage, response.status);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json().catch(() => null)) as T;
}

export const api = {
  get<T = unknown>(endpoint: string) {
    return request<T>(endpoint, { method: "GET" }, "Erro ao buscar dados");
  },

  post<T = unknown>(endpoint: string, data: unknown) {
    return request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }, "Erro ao processar requisição");
  },

  patch<T = unknown>(endpoint: string, data: unknown) {
    return request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }, "Erro ao atualizar");
  },

  delete<T = unknown>(endpoint: string) {
    return request<T>(endpoint, { method: "DELETE" }, "Erro ao processar requisição");
  },
};
