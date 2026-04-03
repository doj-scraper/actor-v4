import { ClerkProvider } from "@clerk/nextjs";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>;
}
