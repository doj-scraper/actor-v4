"use client";

import React, { useEffect, useState } from "react";
import { fetchSystemHealth, SystemHealth } from "@/lib/api";
import { 
  Activity, 
  Database, 
  Server, 
  Terminal, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle,
  Network
} from "lucide-react";

export default function IntegrationHub() {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [contractLog, setContractLog] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);

  const loadHealth = async () => {
    setLoading(true);
    const data = await fetchSystemHealth("");
    setHealthData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const addLog = (msg: string) => {
    setContractLog((prev) => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${msg}`]);
  };

  const runContractValidation = async () => {
    setValidating(true);
    setContractLog([]);
    addLog("INIT: Starting API Contract Validation...");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Test 1: Brands contract
    try {
      addLog("SEND: GET /api/brands");
      const res = await fetch(`${apiUrl}/api/brands`);
      const data = await res.json();
      if (data.success && Array.isArray(data.brands)) {
        addLog(`PASS: /api/brands → { brands: [...] } — ${data.brands.length} brands.`);
      } else {
        addLog("FAIL: /api/brands missing { brands } array.");
      }
    } catch (err: any) {
      addLog(`ERR: /api/brands → ${err.message}`);
    }

    // Test 2: Parts contract (omni search uses ?device=)
    try {
      addLog("SEND: GET /api/parts?device=iPhone 17 Pro Max");
      const res = await fetch(`${apiUrl}/api/parts?device=${encodeURIComponent('iPhone 17 Pro Max')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.parts)) {
        addLog(`PASS: /api/parts → { parts: [...] } — ${data.parts.length} parts found.`);
        const sample = data.parts[0];
        if (sample) {
          if ('wholesalePrice' in sample && Number.isInteger(sample.wholesalePrice)) {
            addLog("PASS: wholesalePrice is Int (cents).");
          } else {
            addLog("FAIL: wholesalePrice missing or not Int!");
          }
          if ('stockLevel' in sample) addLog("PASS: stockLevel present.");
          if ('skuId' in sample) addLog("PASS: skuId (Smart SKU) present.");
        }
      } else {
        addLog("FAIL: /api/parts missing { parts } array.");
      }
    } catch (err: any) {
      addLog(`ERR: /api/parts → ${err.message}`);
    }

    // Test 3: Hierarchy contract
    try {
      addLog("SEND: GET /api/hierarchy");
      const res = await fetch(`${apiUrl}/api/hierarchy`);
      const data = await res.json();
      if (data.success && Array.isArray(data.hierarchy)) {
        addLog(`PASS: /api/hierarchy → { hierarchy: [...] } — ${data.hierarchy.length} brands.`);
      } else {
        addLog("FAIL: /api/hierarchy missing { hierarchy } array.");
      }
    } catch (err: any) {
      addLog(`ERR: /api/hierarchy → ${err.message}`);
    }

    addLog("DONE: Validation complete.");
    setValidating(false);
  };

  return (
    <div className="section-flowing bg-ct-bg text-ct-text p-6 md:p-10">
      {/* Atmospheric Overlays */}
      <div className="grid-overlay"></div>
      <div className="vignette-overlay"></div>
      <div className="noise-overlay"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-hairline pb-6">
          <div className="flex items-center gap-4">
            <Terminal className="text-ct-accent w-8 h-8 animate-float" />
            <h1 className="heading-display text-3xl">
              Integration<span className="text-ct-accent">_Hub</span>
            </h1>
          </div>
          <button 
            onClick={loadHealth}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-ct-accent' : ''}`} />
            <span className="text-micro">SYNC_STATE</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Core Topology Panel */}
          <div className="dashboard-card col-span-1 lg:col-span-2 p-8 flex flex-col">
            <h2 className="text-micro text-ct-text-secondary mb-6 flex items-center gap-2">
              <Network className="w-4 h-4 text-ct-accent" /> Topology Map & Health
            </h2>
            
            {loading ? (
              <div className="animate-pulse text-ct-accent mono text-sm">PINGING_SERVICES...</div>
            ) : healthData ? (
              <div className="space-y-6">
                <div className="stat-card flex items-center gap-4 animate-border-pulse border-ct-accent/30">
                  <div className={`w-3 h-3 rounded-full ${healthData.status === 'green' ? 'bg-ct-accent glow-accent' : 'bg-destructive animate-pulse'}`} />
                  <div>
                    <div className="font-mono text-sm text-ct-accent">Vercel Services Runtime</div>
                    <div className="text-micro text-ct-text-secondary mt-1">Uptime: {Math.floor(healthData.uptime / 60)}m | Env: {healthData.environment}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthData.services.map((svc) => (
                    <div key={svc.name} className="stat-card">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-micro flex items-center gap-2 text-ct-text">
                          {svc.name === 'database' ? <Database className="w-4 h-4 text-ct-text-secondary" /> : <Server className="w-4 h-4 text-ct-text-secondary" />}
                          {svc.name}
                        </span>
                        {svc.status === 'green' ? (
                          <CheckCircle2 className="w-4 h-4 text-ct-accent" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="font-mono text-xs text-ct-text-secondary">
                        Latency: {svc.latencyMs > -1 ? <span className="text-ct-text">{svc.latencyMs}ms</span> : <span className="text-destructive">TIMEOUT</span>}
                      </div>
                      {svc.message && <div className="text-xs text-destructive mt-2 font-mono">{svc.message}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-destructive font-mono text-sm">ERR_CONNECTION_REFUSED</div>
            )}
          </div>

          {/* Database Schema Seed Status */}
          <div className="card-dark col-span-1 flex flex-col">
            <h2 className="text-micro text-ct-text-secondary mb-6 flex items-center gap-2">
              <Database className="w-4 h-4 text-ct-accent" /> Prisma Schema
            </h2>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ct-text-secondary">Hierarchy Models</span>
                <span className="badge">4</span>
              </div>
              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ct-text-secondary">Commerce Models</span>
                <span className="badge">5</span>
              </div>
              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ct-text-secondary">Auth/User Models</span>
                <span className="badge">2</span>
              </div>
              <div className="flex justify-between items-center border-b border-hairline pb-3">
                <span className="text-ct-text-secondary">Monitoring Models</span>
                <span className="badge">4</span>
              </div>
              <div className="pt-4 text-xs text-ct-text-secondary leading-relaxed">
                <span className="text-ct-text block mb-1">Total Target: 19 Models</span>
                Adapter: @neondatabase/serverless
              </div>
            </div>
          </div>

          {/* API Contract Diagnostics Console */}
          <div className="dashboard-card col-span-1 lg:col-span-3 flex flex-col overflow-hidden">
            <div className="bg-ct-bg-secondary p-4 px-6 border-b border-hairline flex justify-between items-center">
              <span className="text-micro flex items-center gap-2 text-ct-text-secondary">
                <Activity className="w-4 h-4 text-ct-accent" /> CONTRACT_VALIDATOR.EXE
              </span>
              <button 
                onClick={runContractValidation}
                disabled={validating}
                className="badge cursor-pointer hover:bg-ct-accent hover:text-ct-bg transition-colors"
              >
                {validating ? 'EXECUTING...' : 'RUN_TEST_SUITE'}
              </button>
            </div>
            <div className="p-6 h-64 overflow-y-auto font-mono text-sm space-y-2 bg-ct-bg/50">
              {contractLog.length === 0 ? (
                <div className="text-ct-text-secondary/50 italic">Waiting for execution...</div>
              ) : (
                contractLog.map((log, i) => (
                  <div key={i} className={log.includes('FAIL') || log.includes('ERR') ? 'text-destructive' : log.includes('PASS') ? 'text-ct-accent glow-accent' : 'text-ct-text'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
