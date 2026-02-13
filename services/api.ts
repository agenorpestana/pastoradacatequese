
// Fixed: Cast import.meta to any to avoid TS error Property 'env' does not exist on type 'ImportMeta'
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  get: async (resource: string) => {
    try {
      const response = await fetch(`${API_URL}/${resource}`);
      if (!response.ok) throw new Error(`Failed to fetch ${resource}`);
      return await response.json();
    } catch (error) {
      console.error(`API Get Error (${resource}):`, error);
      return [];
    }
  },

  post: async (resource: string, data: any) => {
    try {
      const response = await fetch(`${API_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to save ${resource}`);
      return await response.json();
    } catch (error) {
      console.error(`API Post Error (${resource}):`, error);
      throw error;
    }
  },

  put: async (resource: string, id: string, data: any) => {
    try {
      const response = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Failed to update ${resource}`);
      return await response.json();
    } catch (error) {
      console.error(`API Put Error (${resource}):`, error);
      throw error;
    }
  },

  delete: async (resource: string, id: string) => {
    try {
      const response = await fetch(`${API_URL}/${resource}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete ${resource}`);
      return true;
    } catch (error) {
      console.error(`API Delete Error (${resource}):`, error);
      throw error;
    }
  },

  // Helper para salvar Configuração Paroquial
  saveConfig: async (config: any) => {
    try {
      const response = await fetch(`${API_URL}/parish_config`, {
        method: 'POST', // Backend trata como upsert
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return await response.json();
    } catch (error) {
      console.error("Config Save Error:", error);
    }
  }
};