import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, validateToken, clearTokens } from '../api';

export type Role = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'ACCOUNTANT' | 'PRINCIPLE' | 'PARENT';

interface User {
  username: string;
  role: Role;
  schoolId: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string, schoolId?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isValid = await validateToken();
        if (isValid) {
          // Since validateToken currently just returns boolean, we'd ideally decode the JWT here
          // to get the user info. For now, we simulate user extraction from localStorage if valid.
          const storedUser = localStorage.getItem('auth_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
             // If valid but no user data, logout to be safe
             apiLogout();
          }
        } else {
          apiLogout();
        }
      } catch (error) {
        console.error("Auth initialization failed", error);
        apiLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string, schoolId?: string) => {
    try {
      const response = await apiLogin(username, password, schoolId);
      
      const loggedInUser: User = {
        username: response.username,
        role: response.role as Role,
        schoolId: response.schoolId,
        email: response.email,
      };

      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));

    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
