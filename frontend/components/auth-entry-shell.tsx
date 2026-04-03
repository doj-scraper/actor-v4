"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/page-hero";

type AuthMode = "sign-in" | "sign-up";

interface AuthEntryShellProps {
  mode: AuthMode;
}

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const appearance = {
  elements: {
    card: "border border-white/10 bg-ct-bg-secondary/90 shadow-none",
    headerTitle: "text-ct-text",
    headerSubtitle: "text-ct-text-secondary",
    socialButtonsBlockButton:
      "border-white/10 bg-ct-bg text-ct-text hover:bg-ct-bg-secondary",
    formButtonPrimary:
      "bg-ct-accent text-ct-bg hover:bg-ct-accent/90 shadow-none",
    formFieldInput:
      "border-white/10 bg-ct-bg text-ct-text placeholder:text-ct-text-secondary focus:border-ct-accent",
    footerActionLink: "text-ct-accent hover:text-ct-text",
    identityPreviewText: "text-ct-text",
    formFieldLabel: "text-ct-text-secondary",
    dividerLine: "bg-white/10",
    dividerText: "text-ct-text-secondary",
    alertText: "text-red-200",
    formResendCodeLink: "text-ct-accent hover:text-ct-text",
  },
};

function fallbackCopy(mode: AuthMode) {
  if (mode === "sign-in") {
    return {
      title: "Auth is not configured in this workspace",
      body:
        "This frontend can render signed-out fallback states, but Clerk sign-in needs NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and a matching backend setup before the live identity flow can be verified.",
      cta: "Create account",
      href: "/sign-up",
    };
  }

  return {
    title: "Account creation is not configured in this workspace",
    body:
      "This route is ready for Clerk-hosted sign-up, but local verification is blocked until the Clerk publishable key and backend environment are present.",
    cta: "Go to sign in",
    href: "/sign-in",
  };
}

export function AuthEntryShell({ mode }: AuthEntryShellProps) {
  const isSignIn = mode === "sign-in";
  const fallback = fallbackCopy(mode);

  return (
    <section className="pb-20">
      <PageHero
        eyebrow="Phase 2"
        title={
          <>
            {isSignIn ? "ACCOUNT " : "CREATE "}
            <span className="text-ct-accent">
              {isSignIn ? "SIGN IN" : "ACCESS"}
            </span>
          </>
        }
        description={
          isSignIn
            ? "Use your CellTech account to sync protected dashboard data, order history, and backend-authenticated routes."
            : "Create a CellTech account to claim guest orders, persist identity across devices, and unlock protected ordering flows."
        }
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="dashboard-card p-6">
            <p className="text-micro text-ct-accent">Identity contract</p>
            <h2 className="mt-3 text-2xl font-semibold text-ct-text">
              {isSignIn ? "Protected routes depend on this flow." : "Guest-to-account conversion starts here."}
            </h2>
            <div className="mt-6 space-y-4 text-sm text-ct-text-secondary">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-ct-accent" />
                <p>Dashboard and admin access should be backed by Clerk session state plus backend user hydration.</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-ct-accent" />
                <p>The frontend already has auth store and token plumbing. This page provides the missing route entrypoint.</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-ct-accent" />
                <p>When local auth is not configured, the page should fail clearly instead of routing users to a 404.</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-ct-bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-widest text-ct-text-secondary">Current mode</p>
              <p className="mt-2 text-lg font-semibold text-ct-text">
                {clerkConfigured ? "Clerk UI enabled" : "Fallback messaging only"}
              </p>
              <p className="mt-2 text-sm text-ct-text-secondary">
                {clerkConfigured
                  ? "This workspace has a publishable key, so the hosted Clerk form can render here."
                  : "Add local Clerk keys to verify the live sign-in and sign-up flow end-to-end."}
              </p>
            </div>
          </div>

          <div className="dashboard-card p-6 lg:p-8">
            {clerkConfigured ? (
              <div className="flex justify-center">
                {isSignIn ? (
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    appearance={appearance}
                  />
                ) : (
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    appearance={appearance}
                  />
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-300" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-100">{fallback.title}</h3>
                    <p className="mt-2 text-sm text-yellow-50/80">{fallback.body}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={fallback.href} className="btn-primary inline-flex items-center gap-2">
                        {fallback.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link href="/dashboard" className="btn-secondary">
                        Return to dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
