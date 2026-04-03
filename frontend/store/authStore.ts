/**
 * Auth store — powered by Clerk.
 *
 * This store provides a thin Zustand wrapper around Clerk so that the rest
 * of the app can consume a consistent { user, isLoggedIn, isLoading } shape
 * without importing Clerk hooks everywhere.
 *
 * Usage:
 *   const { user, isLoggedIn } = useAuthStore();
 *
 * For sign-in / sign-out use Clerk's own hooks or <SignInButton> / <SignOutButton>
 * components from @clerk/nextjs — do NOT implement custom login/register logic here.
 * Clerk handles all password hashing, sessions, and OAuth.
 */

import { create } from 'zustand';

export interface User {
  id: string;          // Internal CellTech DB id
  clerkId: string;     // Clerk user.id
  email: string;
  name: string;
  company?: string;
  role: 'BUYER' | 'ADMIN';
  isGuest: boolean;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true, // starts true so we don't flash unauthenticated UI

  setUser: (user: User | null) =>
    set({ user, isLoggedIn: user !== null, isLoading: false }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
