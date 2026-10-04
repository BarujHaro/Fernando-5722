import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import CryptoJS from 'crypto-js';
import { type User, type UserSession } from '../types/types';
import { storageService } from '../services/storageService';

//Se define la interfaz
interface AuthContextType {
  session: UserSession | null;
  register: (fullName: string, email: string, pass: string) => boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}
//Se crea el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);
//Es el componente del proveedor
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  //const [session, setSession] = useState<UserSession | null>(null);

  //useEffect(() => {
  //  setSession(storageService.getCurrentSession());
  //}, []);

  //inicializacion diferida
  const [session, setSession] = useState<UserSession | null>(() => {
    return storageService.getCurrentSession();
  });
//funcion de hasheo
  const hashPassword = (password: string) =>
    CryptoJS.SHA256(password).toString();

  const register = (fullName: string, email: string, pass: string): boolean => {
    const newUser: User = {
        id: crypto.randomUUID(),
        fullName: fullName,
        email: email,
        passwordHash: hashPassword(pass)
    };
     
    return storageService.registerUser(newUser);// Retorna true si el registro fue exitoso
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

  //Renderiza el proveedor
  return (
    <AuthContext.Provider value={{ session, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
//HOOK que facilita el consumo de este contexto en cualquier parte de la app
export const useAuth = () => {
  const ctx = useContext(AuthContext);

  //Control de seguridad: Si un componente intenta usar useauth y no esta envuelto por authprovider, lanzara un error explicito
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};