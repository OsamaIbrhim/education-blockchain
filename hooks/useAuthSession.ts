import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

export interface User {
  address: string;
  role: string;
}

interface SessionResponseData {
  isAuthenticated: boolean;
  user: User | null;
  message?: string;
}

interface LoginResponseData {
  success: boolean;
  address?: string;
  role?: string;
  message?: string;
}

interface LogoutResponseData {
  success: boolean;
  message?: string;
}

// More specific error type for Axios errors
export interface AuthApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useAuthSession = () => {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthApiError | null>(null);

  // 1. Initial Session Check
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      if (isMounted) setIsLoadingSession(true);
      if (isMounted) setAuthError(null);
      try {
        const response = await axios.get<SessionResponseData>('/api/auth/session');
        if (isMounted) {
          if (response.data.isAuthenticated && response.data.user) {
            setSessionUser(response.data.user);
          } else {
            setSessionUser(null);
          }
        }
      } catch (err) {
        const error = err as AuthApiError;
        console.error('Session check error:', error.response?.data?.message || error.message);
        if (isMounted) {
          setAuthError(error);
          setSessionUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Login Function
  const login = useCallback(async (address: string, role: string): Promise<boolean> => {
    setIsLoadingSession(true);
    setAuthError(null);
    try {
      const response = await axios.post<LoginResponseData>('/api/auth/login', { address, role });
      if (response.data.success && response.data.address && response.data.role) {
        setSessionUser({ address: response.data.address, role: response.data.role });
        setIsLoadingSession(false);
        return true;
      } else {
        const errorMessage = response.data.message || 'Login failed due to an unknown error.';
        setAuthError({ name: 'LoginError', message: errorMessage, response: response as any });
        setSessionUser(null);
        setIsLoadingSession(false);
        return false;
      }
    } catch (err) {
      const error = err as AuthApiError;
      console.error('Login API error:', error.response?.data?.message || error.message);
      setAuthError(error);
      setSessionUser(null);
      setIsLoadingSession(false);
      return false;
    }
  }, []);

  // 3. Logout Function
  const logout = useCallback(async (): Promise<boolean> => {
    setIsLoadingSession(true);
    setAuthError(null);
    try {
      await axios.post<LogoutResponseData>('/api/auth/logout');
      setSessionUser(null);
      setIsLoadingSession(false);
      return true;
    } catch (err) {
      const error = err as AuthApiError;
      console.error('Logout API error:', error.response?.data?.message || error.message);
      setAuthError(error);
      setSessionUser(null);
      setIsLoadingSession(false);
      return false;
    }
  }, []);

  return { sessionUser, isLoadingSession, authError, login, logout };
};