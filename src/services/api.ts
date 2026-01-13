const API_URL = 'http://localhost:3001';

export const api = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('token'); 

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
      throw new Error(errorData.message || 'Erro ao salvar transação');
    }

    return response.json();
  }
};