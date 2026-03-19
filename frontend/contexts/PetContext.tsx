import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Pet, Wallet } from '../types';
import { petService } from '../services/petService';
import { walletService } from '../services/walletService';
import { useApp } from './AppContext';

interface PetContextType {
  pet: Pet | null;
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  refreshPet: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  feedPet: () => Promise<void>;
  interactPet: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useApp();

  const refreshPet = useCallback(async () => {
    try {
      const data = await petService.getPet();
      setPet(data);
    } catch (err) {
      console.error('Failed to fetch pet', err);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const data = await walletService.getWallet();
      setWallet(data);
    } catch (err) {
      console.error('Failed to fetch wallet', err);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([refreshPet(), refreshWallet()]);
    } catch (err: any) {
      setError(err.message || 'Failed to load pet data');
    } finally {
      setLoading(false);
    }
  }, [refreshPet, refreshWallet]);

  useEffect(() => {
    if (token) {
      init();
    } else {
      setPet(null);
      setWallet(null);
    }
  }, [init, token]);

  const feedPet = async () => {
    try {
      const updatedPet = await petService.feedPet();
      setPet(updatedPet);
      // Feeding might cost money, so refresh wallet too
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to feed pet');
      throw err;
    }
  };

  const interactPet = async () => {
    try {
      const updatedPet = await petService.interactPet();
      setPet(updatedPet);
      // Interaction might earn money or exp
      await refreshWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to interact with pet');
      throw err;
    }
  };

  return (
    <PetContext.Provider
      value={{
        pet,
        wallet,
        loading,
        error,
        refreshPet,
        refreshWallet,
        feedPet,
        interactPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};
