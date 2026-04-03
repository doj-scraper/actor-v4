import type { Metadata } from "next";
import { AuthEntryShell } from "@/components/auth-entry-shell";

export const metadata: Metadata = {
  title: "Create account | CellTech Distributor",
  description: "Create a CellTech account to claim orders and unlock protected flows.",
};

export default function SignUpPage() {
  return <AuthEntryShell mode="sign-up" />;
}
