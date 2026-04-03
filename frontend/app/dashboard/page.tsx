import type { Metadata } from "next";
import { DashboardSection } from '@/components/dashboard-section';

export const metadata: Metadata = {
  title: "Dashboard | CellTech Distributor",
  description: "Manage your account, view orders, and track shipments.",
};

export default function DashboardPage() {
  return <DashboardSection />;
}
