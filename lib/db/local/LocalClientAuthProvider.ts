'use client';

import type {
  IClientAuthProvider,
  AuthUser,
  AuthResult,
  Unsubscribe,
} from '@/lib/db/interfaces';
import type { UserProfile } from '@/types/resume';

export class LocalClientAuthProvider implements IClientAuthProvider {
  async getUser(): Promise<AuthUser | null> {
    try {
      const res = await fetch('/api/auth/local/me');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(
        `/api/auth/local/profile?userId=${encodeURIComponent(userId)}`
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/local/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return {
        error: res.ok ? null : new Error(data.error ?? 'Sign in failed'),
      };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async signUp(
    email: string,
    password: string,
    _redirectTo: string
  ): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/local/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return {
        error: res.ok ? null : new Error(data.error ?? 'Sign up failed'),
      };
    } catch (err) {
      return { error: err as Error };
    }
  }

  async updateUser(_attrs: {
    email?: string;
    password?: string;
  }): Promise<AuthResult> {
    // Anonymous user conversion is not supported in local mode; treat as no-op
    return { error: null };
  }

  async signInWithOAuth(
    _provider: string,
    _redirectTo: string
  ): Promise<AuthResult> {
    return { error: new Error('OAuth is not supported in local mode') };
  }

  async linkIdentity(
    _provider: string,
    _redirectTo: string
  ): Promise<AuthResult> {
    return { error: new Error('OAuth is not supported in local mode') };
  }

  async signInAnonymously(): Promise<AuthResult> {
    // Anonymous sessions are not supported in local mode; redirect to auth
    return {
      error: new Error('Anonymous sign-in is not supported in local mode'),
    };
  }

  async signOut(): Promise<void> {
    await fetch('/api/auth/local/signout', { method: 'POST' });
  }

  onAuthStateChange(_callback: (user: AuthUser | null) => void): Unsubscribe {
    // No real-time auth state in local mode
    return () => {};
  }
}
