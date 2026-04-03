/**
 * useAuth — unified auth hook.
 *
 * Combines Clerk's session state with our internal user record fetched
 * from the CellTech backend. Hydrates the authStore on first mount.
 *
 * Returns the same shape as authStore so components don't need to know
 * whether auth comes from Clerk or the store.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSafeClerkAuth, useSafeClerkUser } from '@/lib/clerk-safe';
import { fetchUserProfile } from '@/lib/api';

export function useAuth() {
  const { user: clerkUser, isLoaded } = useSafeClerkUser();
  const { getToken } = useSafeClerkAuth();
  const { user, isLoggedIn, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
      // Not signed in
      setUser(null);
      return;
    }

    // Clerk user is signed in — fetch the internal profile from our backend
    const syncProfile = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          return;
        }
        const profile = await fetchUserProfile(token);
        if (profile) {
          setUser({
            id: profile.id,
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress ?? profile.email,
            name: clerkUser.fullName ?? profile.name ?? '',
            company: profile.company ?? undefined,
            role: profile.role ?? 'BUYER',
            isGuest: profile.isGuest ?? false,
          });
        } else {
          // Backend profile not found yet (webhook might not have fired)
          // Fall back to Clerk data only
          setUser({
            id: '',
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
            name: clerkUser.fullName ?? '',
            role: 'BUYER',
            isGuest: false,
          });
        }
      } catch {
        setUser(null);
      }
    };

    syncProfile();
  }, [clerkUser, isLoaded, getToken, setUser, setLoading]);

  return { user, isLoggedIn, isLoading };
}
