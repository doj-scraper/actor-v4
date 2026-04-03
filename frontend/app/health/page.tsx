'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Database, RefreshCcw, Server } from 'lucide-react';
import { ErrorState } from '@/components/error-state';
import { PageLoadingState } from '@/components/loading-state';
import { PageHero } from '@/components/page-hero';
import { SummaryPanel } from '@/components/summary-panel';
import {
  fetchBackendHealth,
  type PublicHealth,
  type PublicDependencyHealth,
} from '@/lib/api';

function statusTone(status: PublicHealth['status']) {
  switch (status) {
    case 'healthy':
      return {
        label: 'Healthy',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      };
    case 'degraded':
      return {
        label: 'Degraded',
        className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
      };
    default:
      return {
        label: 'Unhealthy',
        className: 'border-red-500/30 bg-red-500/10 text-red-200',
      };
  }
}

function dependencyValue(check: PublicDependencyHealth): string {
  if (check.latencyMs === null) {
    return check.status;
  }
  return `${check.status} (${check.latencyMs}ms)`;
}

export default function HealthPage() {
  const [health, setHealth] = useState<PublicHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(false);
    const result = await fetchBackendHealth();
    if (!result) {
      setError(true);
      setLoading(false);
      return;
    }

    setHealth(result);
    setLastChecked(new Date().toLocaleTimeString());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const tone = health ? statusTone(health.status) : null;

  return (
    <section className="pb-20">
      <PageHero
        eyebrow="Phase 1"
        title={<>API <span className="text-ct-accent">HEALTH CHECK</span></>}
        description="This page fetches the backend health endpoint from the browser so transport, base URL, and CORS issues show up immediately."
        actions={
          <>
            <button type="button" onClick={refresh} className="btn-primary inline-flex items-center gap-2">
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh probe
            </button>
            <Link href="/inventory" className="btn-secondary">
              Continue to inventory
            </Link>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
        {loading && !health && <PageLoadingState />}

        {error && !health && (
          <ErrorState
            title="Backend health check failed"
            message="The frontend could not fetch /api/health from the configured backend. Check the backend dev server, NEXT_PUBLIC_API_URL, and local CORS settings."
            onRetry={refresh}
            retryLabel="Retry health check"
          />
        )}

        {health && tone && (
          <>
            <div className={`rounded-2xl border p-5 ${tone.className}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-micro uppercase tracking-[0.2em]">Backend status</p>
                  <p className="mt-2 text-2xl font-semibold">{tone.label}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Ready: <span className="font-mono">{String(health.ready)}</span></p>
                  <p>Timestamp: <span className="font-mono">{new Date(health.timestamp).toLocaleString()}</span></p>
                  {lastChecked && <p>Last checked: <span className="font-mono">{lastChecked}</span></p>}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SummaryPanel
                title="Dependency checks"
                description="Basic liveness from the public backend health route."
                items={[
                  {
                    label: 'Database',
                    value: dependencyValue(health.checks.database),
                    helper: health.checks.database.error ?? 'Database connectivity check passed.',
                    icon: <Database className="h-4 w-4" />,
                    tone: health.checks.database.status === 'healthy' ? 'accent' : 'default',
                  },
                  {
                    label: 'Redis',
                    value: dependencyValue(health.checks.redis),
                    helper: health.checks.redis.error ?? 'Redis connectivity check passed.',
                    icon: <Server className="h-4 w-4" />,
                    tone: health.checks.redis.status === 'healthy' ? 'accent' : 'default',
                  },
                ]}
                footerLabel="Overall API state"
                footerValue={health.status.toUpperCase()}
                footerNote="`ready` only turns true when the database check is healthy."
              />

              <SummaryPanel
                title="Probe intent"
                description="This is the Phase 1 frontend proof point."
                items={[
                  {
                    label: 'Origin path',
                    value: '/api/health',
                    helper: 'Fetched through the frontend API base URL in the browser.',
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    tone: 'accent',
                  },
                  {
                    label: 'Failure mode',
                    value: error ? 'Blocked' : 'Observable',
                    helper: 'If this fetch fails, Phase 1 should stop until transport/CORS/env is fixed.',
                    icon: <AlertTriangle className="h-4 w-4" />,
                  },
                ]}
                footerLabel="Next step"
                footerValue="Phase 1"
                footerNote="Once this page is reliable locally, the frontend transport path is proven."
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
