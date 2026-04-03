"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const noopAsync = async () => undefined;
const nullToken = async () => null;
const alwaysFalse = () => false;

const safeAuthFallback = {
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  actor: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  has: alwaysFalse,
  signOut: noopAsync,
  getToken: nullToken,
};

const safeUserFallback = {
  isLoaded: true,
  isSignedIn: false,
  user: null,
};

export function useSafeClerkAuth() {
  if (!clerkEnabled) {
    return safeAuthFallback;
  }

  try {
    return useClerkAuth();
  } catch {
    return safeAuthFallback;
  }
}

export function useSafeClerkUser() {
  if (!clerkEnabled) {
    return safeUserFallback;
  }

  try {
    return useUser();
  } catch {
    return safeUserFallback;
  }
}
