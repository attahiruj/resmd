import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { IServerAuthProvider, AuthUser } from '@/lib/db/interfaces';

export class SupabaseServerAuthProvider implements IServerAuthProvider {
  async getUser(): Promise<AuthUser | null> {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      is_anonymous: user.is_anonymous ?? false,
    };
  }
}
