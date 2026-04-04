'use client';

import { PerformanceMatrix } from '@/components/admin/PerformanceMatrix';
import { Activity, ShieldCheck, Database, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const stats = [
    { label: "Active Orders", value: "24", icon: Activity, color: "text-primary" },
    { label: "DB Connections", value: "Healthy", icon: Database, color: "text-success" },
    { label: "Admin Role", value: "Verified", icon: ShieldCheck, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Admin Command Center
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest">
            Strategic Inventory & System Oversight
          </p>
        </div>
        
        <Link 
          href="/admin/health"
          className="bg-secondary text-secondary-foreground border border-border px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-background transition-colors"
        >
          System Health Detailed
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-sm flex items-center gap-6">
            <div className={`p-4 bg-secondary/50 rounded-sm ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Matrix Section */}
      <div className="mb-12">
        <PerformanceMatrix />
      </div>

      {/* Placeholder for future sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50">
        <div className="bg-card border border-border border-dashed p-12 rounded-sm flex flex-col items-center justify-center text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Recent System Events</p>
          <p className="text-[10px] mt-2">Coming in Phase 8 Expansion</p>
        </div>
        <div className="bg-card border border-border border-dashed p-12 rounded-sm flex flex-col items-center justify-center text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Order Volume Timeline</p>
          <p className="text-[10px] mt-2">Coming in Phase 8 Expansion</p>
        </div>
      </div>
    </div>
  );
}
