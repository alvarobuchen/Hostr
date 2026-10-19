'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
  type User as FbUser,
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '@/lib/firebase/client';

export type Role = 'GUEST' | 'HOST' | 'ADMIN';

export type AuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: Role;
  /** Sign-in providers linked to this account, e.g. ['google.com'] or ['password']. */
  providers: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  /** Add an email+password credential to the signed-in account (e.g. a
   *  Google user who also wants to log in with a password). */
  linkPassword: (password: string) => Promise<void>;
  /** Force a claims refresh (e.g. after a host claims their venue). */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function mapUser(fbUser: FbUser): Promise<AuthUser> {
  const token = await fbUser.getIdTokenResult();
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName,
    picture: fbUser.photoURL,
    role: ((token.claims.role as Role) || 'GUEST'),
    providers: fbUser.providerData.map((p) => p.providerId),
  };
}

/** Hand the current ID token to the server so it can set the session cookie. */
async function syncSessionCookie() {
  const current = auth.currentUser;
  if (!current) return;
  const idToken = await current.getIdToken();
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error(`Session cookie exchange failed (${res.status})`);
  }
  // The server just set the default role claim on first sign-in — refresh the
  // client token so `user.role` reflects it without a reload.
  await current.getIdToken(true);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      setUser(fbUser ? await mapUser(fbUser) : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
      await syncSessionCookie();
    },
    signUp: async (email, password, name) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await syncSessionCookie();
    },
    signInWithGoogle: async () => {
      await signInWithPopup(auth, googleProvider);
      await syncSessionCookie();
    },
    signInWithApple: async () => {
      await signInWithPopup(auth, appleProvider);
      await syncSessionCookie();
    },
    signOut: async () => {
      await fbSignOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
    },
    sendReset: (email) => sendPasswordResetEmail(auth, email),
    linkPassword: async (password) => {
      const current = auth.currentUser;
      if (!current?.email) throw new Error('No signed-in account with an email.');
      const cred = EmailAuthProvider.credential(current.email, password);
      await linkWithCredential(current, cred);
      await current.reload();
      setUser(await mapUser(current));
    },
    refresh: async () => {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        setUser(await mapUser(auth.currentUser));
      }
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
