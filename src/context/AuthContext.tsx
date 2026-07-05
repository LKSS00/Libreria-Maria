import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Usuario } from '../types';
import { usuariosMock } from '../data/mockData';

interface AuthContextType {
  user: Usuario | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  const login = (username: string, password: string): boolean => {
    const found = usuariosMock.find(
      u => u.username === username && u.password === password
    );
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
