'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSafeClerkAuth } from '@/lib/clerk-safe';
import { fetchSystemHealth, type SystemHealth, type ServiceHealth } from '@/lib/api';

const REFRESH_INTERVAL = 30_000;

function latencyColor(ms: number): string {
  if (ms < 200) return 'text-emerald-400';
  if (ms <= 500) return 'text-yellow-400';
  return 'text-red-400';
}

function statusDotClasses(status: ServiceHealth['status']): string {
  const base = 'inline-block h-3 w-3 rounded-full';
  switch (status) {
    case 'green': return `${base} bg-emerald-500`;
    case 'yellow': return `${base} bg-yellow-400 animate-pulse`;
    case 'red': return `${base} bg-red-500 animate-pulse`;
    default: return `${base} bg-gray-500`;
  }
}

function overallBanner(status: SystemHealth['status']) {
  const styles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      label: 'All Systems Operational',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      label: 'Degraded Performance',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'System Issues Detected',
    },
  };
  return styles[status];
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// --- Skeleton Components ---

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 rounded bg-gray-700" />
        <div className="h-3 w-3 rounded-full bg-gray-700" />
      </div>
      <div className="h-6 w-16 rounded bg-gray-700 mb-2" />
      <div className="h-3 w-32 rounded bg-gray-700" />
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4 animate-pulse">
      <div className="h-5 w-48 rounded bg-gray-700 mx-auto" />
    </div>
  );
}

// --- Service Card ---

function ServiceCard({ service }: { service: ServiceHealth }) {
  // latencyMs is -1 when the service is DOWN (null from backend)
  const latencyDisplay = service.latencyMs < 0 ? '—' : `${service.latencyMs}ms`;
  const latencyClass = service.latencyMs < 0 ? 'text-red-400' : latencyColor(service.latencyMs);

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-5 transition-colors hover:border-gray-600/60">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{service.name}</h3>
        <span className={statusDotClasses(service.status)} />
      </div>
      <p className={`font-mono text-2xl font-medium ${latencyClass}`}>
        {latencyDisplay}
      </p>
      {service.message && (
        <p className="mt-1 text-xs text-gray-500">{service.message}</p>
      )}
    </div>
  );
}

// --- Main Page ---

export default function SystemHealthPage() {
  const { getToken } = useSafeClerkAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    // Pass the ADMIN Clerk token so the backend can verify the role
    const token = await getToken().catch(() => undefined);
    const data = await fetchSystemHealth(token ?? undefined);
    if (data) {
      setHealth(data);
      setLastRefresh(new Date());
      setError(false);
    } else {
      setError(true);
    }
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  // Error state
  if (error && !health) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-white">System Health</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400 font-medium mb-1">Unable to reach backend</p>
          <p className="text-sm text-gray-500 mb-4">
            The health endpoint is not responding. Check that the backend is running.
          </p>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700"
          >
            ↻ Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton (first load only)
  if (loading && !health) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold text-white">System Health</h1>
        <BannerSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!health) return null;

  const banner = overallBanner(health.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-white">System Health</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700 disabled:opacity-50"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl border ${banner.border} ${banner.bg} p-4 text-center`}>
        <p className={`font-medium ${banner.text}`}>{banner.label}</p>
      </div>

      {/* Error toast (when we have stale data but latest fetch failed) */}
      {error && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-400">
          Latest refresh failed — showing last known state.
        </div>
      )}

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {health.services.map((svc) => (
          <ServiceCard key={svc.name} service={svc} />
        ))}
      </div>

      {/* Footer metadata */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
        <span>Uptime: <span className="text-gray-400 font-mono">{formatUptime(health.uptime)}</span></span>
        <span>Server time: <span className="text-gray-400 font-mono">{new Date(health.timestamp).toLocaleString()}</span></span>
        {lastRefresh && (
          <span>Last checked: <span className="text-gray-400 font-mono">{lastRefresh.toLocaleTimeString()}</span></span>
        )}
        <span className="text-gray-600">Auto-refresh: 30s</span>
      </div>
    </div>
  );
}
