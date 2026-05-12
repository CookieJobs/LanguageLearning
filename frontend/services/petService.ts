import { apiFetch } from './apiClient';
import { API_BASE } from './config';
import { Pet } from '../types';

export const petService = {
  getPet: async (): Promise<Pet> => {
    const response = await apiFetch(`${API_BASE}/api/pet`);
    if (!response.ok) {
      throw new Error('Failed to fetch pet');
    }
    return response.json();
  },

  feedPet: async (): Promise<Pet> => {
    const response = await apiFetch(`${API_BASE}/api/pet/feed`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to feed pet');
    }
    const data = await response.json();
    return data.pet || data;
  },

  interactPet: async (): Promise<Pet> => {
    const response = await apiFetch(`${API_BASE}/api/pet/interact`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to interact with pet');
    }
    const data = await response.json();
    return data.pet || data;
  },
};
