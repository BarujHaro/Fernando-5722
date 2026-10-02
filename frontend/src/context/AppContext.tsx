import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserSession } from '../types/types';
import { storageService } from '../services/storageService';

interface AppContextType {
    session: UserSession | null;
    balance: number;
    login: (email: string, passwordHash: string) => Promise<boolean>;
    logout: () => void;
    reloadBalance: () => void;
    addFunds: (amount: number) => void;
    isLoading: boolean; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [session, setSession] = useState<UserSession | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);   

    useEffect(() => {
        const initialSession = storageService.getCurrentSession();
        const initialBalance = storageService.getBalance();
        
        setSession(initialSession);
        setBalance(initialBalance);
        setIsLoading(false);
    }, []);

    const login = async (email: string, passwordHash: string): Promise<boolean> => {
        const newSession = storageService.loginUser(email, passwordHash);
        if (newSession) {
        setSession(newSession);
        setBalance(storageService.getBalance()); 
        return true;
        }
        return false;
    };

    const logout = () => {
        storageService.logout();
        setSession(null);
        setBalance(0);
    };

    const reloadBalance = () => {
        setBalance(storageService.getBalance());
    }

    const addFunds = (amount: number) => {
        try {
            const newBalance = storageService.updateBalance(amount);
            setBalance(newBalance); 
        } catch (error) {
            console.error(error);

        }
    }

    const value = {
        session,
        balance,
        login,
        logout,
        reloadBalance,
        addFunds,
        isLoading
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};