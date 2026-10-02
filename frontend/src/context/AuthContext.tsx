import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import CryptoJS from 'crypto-js';
import { type User, type UserSession } from '../types/types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  session: UserSession | null;
  register: (fullName: string, email: string, pass: string) => boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(storageService.getCurrentSession());
  }, []);

  const hashPassword = (password: string) =>
    CryptoJS.SHA256(password).toString();

  const register = (fullName: string, email: string, pass: string): boolean => {
    const newUser: User = {
        id: crypto.randomUUID(),
        fullName: fullName,
        email: email,
        passwordHash: hashPassword(pass)
    };
     
    return storageService.registerUser(newUser);
  };

  const login = (email: string, pass: string): boolean => {
    const newSession = storageService.loginUser(email, hashPassword(pass));
    if (newSession) {
      setSession(newSession);
      return true;
    }
    return false;
  };

  const logout = () => {
    storageService.logout();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};