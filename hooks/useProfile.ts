'use client';

import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { UserProfile } from '@/types/resume';
import type { User } from '@supabase/supabase-js';

interface ProfileState {
  user: User | null;
  profile: UserProfile | null;
  isPro: boolean;
  loading: boolean;
  error: Error | null;
}

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    user: null,
    profile: null,
    isPro: false,
    loading: true,
    error: null,
  });

  // Keep supabase client stable across renders
  const supabaseRef = useRef(createSupabaseBrowserClient());

  const fetchProfile = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const {
        data: { user },
        error: userError,
      } = await supabaseRef.current.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        setState({
          user: null,
          profile: null,
          isPro: false,
          loading: false,
          error: null,
        });
        return;
      }

      const { data: row, error: profileError } = await supabaseRef.current
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const profile: UserProfile = {
        id: row.id,
        email: row.email,
        isPro: row.is_pro,
        stripeCustomerId: row.stripe_customer_id ?? null,
        proExpiresAt: row.pro_expires_at ?? null,
        aiUsageThisMonth: row.ai_usage_this_month,
        createdAt: row.created_at,
      };

      setState({
        user,
        profile,
        isPro: row.is_pro,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err as Error }));
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, refresh: fetchProfile };
}
