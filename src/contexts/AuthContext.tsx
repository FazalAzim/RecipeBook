import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/firebase/authService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.loginUser(email, password);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'customer'): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authService.registerUser(name, email, password, role);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = Boolean(user);
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
