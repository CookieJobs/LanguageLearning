import { apiFetch } from './apiClient';
import { API_BASE } from './config';
import { Wallet } from '../types';

export const walletService = {
  getWallet: async (): Promise<Wallet> => {
    const response = await apiFetch(`${API_BASE}/api/wallet`);
    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }
    return response.json();
  },
};
