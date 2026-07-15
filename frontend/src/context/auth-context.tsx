import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';

import { decodeJwt, logoutUser, refreshAccessToken, useKeycloakAuth } from '@/services/keycloak/auth';
import { getAccessToken } from '@/services/keycloak/token';

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  name?: string;
  roles: string[];
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  signingIn: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromClaims(claims: any): AuthUser | null {
  if (!claims) return null;
  return {
    id: claims.sub,
    username: claims.preferred_username ?? claims.sub,
    email: claims.email,
    name: claims.name,
    roles: claims.realm_access?.roles ?? [],
  };
}

function isExpired(claims: any): boolean {
  if (!claims?.exp) return true;
  return Date.now() >= claims.exp * 1000;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const { request, response, promptAsync, handleLoginResponse } = useKeycloakAuth();

  useEffect(() => {
    (async () => {
      const existingToken = await getAccessToken();
      if (!existingToken) {
        setStatus('signedOut');
        return;
      }
      const claims = decodeJwt(existingToken);
      if (claims && !isExpired(claims)) {
        setUser(userFromClaims(claims));
        setStatus('signedIn');
        return;
      }
      try {
        const refreshed = await refreshAccessToken();
        setUser(userFromClaims(decodeJwt(refreshed)));
        setStatus('signedIn');
      } catch {
        setStatus('signedOut');
      }
    })();

    const handleExpire = () => {
      setStatus('signedOut');
      setUser(null);
    };

    let sub: any;
    if (Platform.OS === 'web') {
      window.addEventListener('session-expired', handleExpire);
    } else {
      sub = DeviceEventEmitter.addListener('session-expired', handleExpire);
    }

    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('session-expired', handleExpire);
      } else if (sub) {
        sub.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      // Reacting to expo-auth-session's redirect result (an external
      // system), not deriving state from props — flip the flag immediately
      // so the UI shows "signing in" while the token exchange is in flight.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSigningIn(true);
      handleLoginResponse(response)
        .then((tokenResult) => {
          if (tokenResult?.accessToken) {
            setUser(userFromClaims(decodeJwt(tokenResult.accessToken)));
            setStatus('signedIn');
          }
        })
        .catch((err) => {
          console.error('Failed to complete Keycloak sign-in:', err);
          setStatus('signedOut');
        })
        .finally(() => setSigningIn(false));
    } else if (response.type === 'error' || response.type === 'cancel' || response.type === 'dismiss') {
      setSigningIn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = () => {
    setSigningIn(true);
    promptAsync().catch((err) => {
      console.error('Failed to open Keycloak login:', err);
      setSigningIn(false);
    });
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
    setStatus('signedOut');
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signingIn: signingIn || !request,
      signIn,
      signOut,
      hasRole: (role: string) => user?.roles.includes(role) ?? false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, user, signingIn, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
