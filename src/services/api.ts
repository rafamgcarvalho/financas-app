const API_URL = 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const api = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post(endpoint: string, data: any) {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao processar requisição');
    }

    return response.json();
  },

  async get(endpoint: string) {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar dados');
    }

    return response.json();
  }
};