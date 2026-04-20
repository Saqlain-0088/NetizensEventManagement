import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { toast } from 'sonner';

interface GoogleAuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('google_access_token');
  });

  // Track token expiration
  const [expiresAt, setExpiresAt] = useState<number>(() => {
    const saved = localStorage.getItem('google_token_expiry');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_token_expiry', expiresAt.toString());
    } else {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_expiry');
    }
  }, [accessToken, expiresAt]);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google login success:', tokenResponse);
      setAccessToken(tokenResponse.access_token);
      // Token usually expires in 3599 seconds (1 hour)
      const expiry = Date.now() + (tokenResponse.expires_in || 3600) * 1000;
      setExpiresAt(expiry);
      toast.success('Connected to Google Calendar');
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Failed to connect to Google Calendar');
    },
    scope: 'https://www.googleapis.com/auth/calendar.events',
  });

  const logout = useCallback(() => {
    googleLogout();
    setAccessToken(null);
    setExpiresAt(0);
    toast.info('Disconnected from Google Calendar');
  }, []);

  // Check for expired token
  useEffect(() => {
    if (accessToken && Date.now() > expiresAt) {
      setAccessToken(null);
    }
  }, [accessToken, expiresAt]);

  const isAuthenticated = !!accessToken && Date.now() < expiresAt;

  return (
    <GoogleAuthContext.Provider value={{ 
      accessToken: isAuthenticated ? accessToken : null, 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider');
  }
  return context;
};
