'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase';
import type {
  IClientAuthProvider,
  AuthUser,
  AuthResult,
  Unsubscribe,
} from '@/lib/db/interfaces';
import type { UserProfile } from '@/types/resume';

export class SupabaseClientAuthProvider implements IClientAuthProvider {
  private get client() {
    return createSupabaseBrowserClient();
  }

  async getUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email,
      is_anonymous: user.is_anonymous ?? false,
    };
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return { id: data.id, email: data.email, createdAt: data.created_at };
  }

  async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const { error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  }

  async signUp(
    email: string,
    password: string,
    redirectTo: string
  ): Promise<AuthResult> {
    const { error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    return { error: error as Error | null };
  }

  async updateUser(attrs: {
    email?: string;
    password?: string;
  }): Promise<AuthResult> {
    const { error } = await this.client.auth.updateUser(attrs);
    return { error: error as Error | null };
  }

  async signInWithOAuth(
    provider: string,
    redirectTo: string
  ): Promise<AuthResult> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider: provider as 'google',
      options: { redirectTo },
    });
    return { error: error as Error | null };
  }

  async linkIdentity(
    provider: string,
    redirectTo: string
  ): Promise<AuthResult> {
    const { error } = await this.client.auth.linkIdentity({
      provider: provider as 'google',
      options: { redirectTo },
    });
    return { error: error as Error | null };
  }

  async signInAnonymously(): Promise<AuthResult> {
    const { error } = await this.client.auth.signInAnonymously();
    return { error: error as Error | null };
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): Unsubscribe {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        callback(null);
      } else {
        callback({
          id: user.id,
          email: user.email,
          is_anonymous: user.is_anonymous ?? false,
        });
      }
    });
    return () => data.subscription.unsubscribe();
  }
}
