'use client';

import { useEffect, useRef, useState } from 'react';
import { getClientAuthProvider } from '@/lib/db/client';
import type { UserProfile } from '@/types/resume';
import type { AuthUser } from '@/lib/db/interfaces';

interface ProfileState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const authRef = useRef(getClientAuthProvider());

  const fetchProfile = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = await authRef.current.getUser();

      if (!user) {
        setState({ user: null, profile: null, loading: false, error: null });
        return;
      }

      const profile = await authRef.current.getProfile(user.id);

      setState({ user, profile, loading: false, error: null });
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
