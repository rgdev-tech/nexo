import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import {
  registerForPushNotificationsAsync,
  registerTokenWithApi,
  removeTokenFromApi,
} from './notifications';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  pushToken: string | null;
  signIn: () => void; // Placeholder, actual logic in screens
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  pushToken: null,
  signIn: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const pushTokenRegistered = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registrar push token cuando hay sesión activa
  useEffect(() => {
    if (!session?.access_token || pushTokenRegistered.current) return;

    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setPushToken(token);
          // Usar la URL de la API hardcoded no es ideal, pero el auth provider
          // se monta antes que el settings provider. Usamos process.env como fallback.
          const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
          if (apiUrl) {
            await registerTokenWithApi(apiUrl, session.access_token, token);
            pushTokenRegistered.current = true;
          }
        }
      } catch (e) {
        console.warn('[Auth] Push token registration failed:', e);
      }
    })();
  }, [session?.access_token]);

  const signOut = async () => {
    try {
      // Intentar desregistrar el push token
      if (pushToken && session?.access_token) {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
        if (apiUrl) {
          await removeTokenFromApi(apiUrl, session.access_token, pushToken);
        }
      }
      setPushToken(null);
      pushTokenRegistered.current = false;
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[Auth] signOut failed:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, pushToken, signIn: () => {}, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
