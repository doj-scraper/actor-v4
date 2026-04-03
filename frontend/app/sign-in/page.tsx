import type { Metadata } from "next";
import { AuthEntryShell } from "@/components/auth-entry-shell";

export const metadata: Metadata = {
  title: "Sign in | CellTech Distributor",
  description: "Sign in to access protected CellTech ordering and dashboard flows.",
};

export default function SignInPage() {
  return <AuthEntryShell mode="sign-in" />;
}
