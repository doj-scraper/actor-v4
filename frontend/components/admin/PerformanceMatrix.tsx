'use client';

import { useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { Target, TrendingUp, PackageOpen } from 'lucide-react';

// Mock data representing what your Admin /api/inventory/analytics endpoint would return
const MOCK_INVENTORY_STATS = [
  { sku: "AI-IP15PR-1A-OR", name: "iPhone 15 Pro Screen OEM", volume: 120, margin: 65, category: "Visual" },
  { sku: "AI-IP14ZZ-3A-OR", name: "iPhone 14 Battery", volume: 340, margin: 25, category: "Functional" },
  { sku: "SA-GS24U-1A-OR", name: "Galaxy S24 Ultra Screen", volume: 45, margin: 55, category: "Visual" },
  { sku: "AI-IP13ZZ-4A-RF", name: "iPhone 13 Charge Port", volume: 210, margin: 85, category: "Interconnects" },
  { sku: "TOOL-ADH-01", name: "Waterproof Adhesive Strip", volume: 500, margin: 15, category: "Consumables" },
  { sku: "IC-TRISTAR-U2", name: "Tristar Charging IC", volume: 15, margin: 90, category: "Board" },
  { sku: "SA-GA54-2A-OEM", name: "Galaxy A54 Back Glass", volume: 30, margin: 20, category: "Chassis" },
  { sku: "AI-IP12ZZ-3B-OR", name: "iPhone 12 Camera Module", volume: 80, margin: 45, category: "Functional" },
];

export function PerformanceMatrix() {
  const medians = useMemo(() => {
    const vols = [...MOCK_INVENTORY_STATS].map(d => d.volume).sort((a, b) => a - b);
    const margins = [...MOCK_INVENTORY_STATS].map(d => d.margin).sort((a, b) => a - b);
    return {
      volume: vols[Math.floor(vols.length / 2)],
      margin: margins[Math.floor(margins.length / 2)]
    };
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border p-4 rounded-sm shadow-xl animate-in zoom-in-95 duration-200">
          <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">{data.sku}</p>
          <p className="text-sm font-bold text-foreground mb-3">{data.name}</p>
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">30d Volume</p>
              <p className="font-mono text-foreground font-bold">{data.volume} units</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Est. Margin</p>
              <p className="font-mono text-foreground font-bold">{data.margin}%</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border p-6 rounded-sm w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Performance Matrix
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Volume vs. Margin Analysis (30 Days)</p>
        </div>
        
        <div className="hidden md:flex gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success"></div> Stars
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary"></div> Workhorses
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-warning"></div> Question Marks
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div> Clearance
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              type="number" 
              dataKey="volume" 
              name="Volume" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'monospace' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Unit Volume (30d) →', position: 'insideBottomRight', offset: -10, fill: 'hsl(var(--muted-foreground))', fontSize: 10, className: 'uppercase tracking-widest' }}
            />
            <YAxis 
              type="number" 
              dataKey="margin" 
              name="Margin" 
              unit="%" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'monospace' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              label={{ value: 'Margin %', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--muted-foreground))', fontSize: 10, className: 'uppercase tracking-widest' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--border))' }} />
            <ReferenceLine x={medians.volume} stroke="hsl(var(--border))" strokeDasharray="5 5" opacity={0.5} />
            <ReferenceLine y={medians.margin} stroke="hsl(var(--border))" strokeDasharray="5 5" opacity={0.5} />

            <Scatter name="Inventory" data={MOCK_INVENTORY_STATS}>
              {MOCK_INVENTORY_STATS.map((entry, index) => {
                let color = 'hsl(var(--muted-foreground))';
                if (entry.volume >= medians.volume && entry.margin >= medians.margin) {
                  color = 'hsl(var(--success))';
                } else if (entry.volume >= medians.volume && entry.margin < medians.margin) {
                  color = 'hsl(var(--primary))';
                } else if (entry.volume < medians.volume && entry.margin >= medians.margin) {
                  color = 'hsl(var(--warning))';
                }
                return <Cell key={`cell-${index}`} fill={color} className="transition-all duration-300 hover:opacity-80" />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="flex gap-4">
          <TrendingUp className="w-8 h-8 text-success opacity-50" strokeWidth={1} />
          <div>
            <h4 className="text-sm font-bold text-foreground">Stars</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">High Vol / High Margin</p>
          </div>
        </div>
        <div className="flex gap-4">
          <PackageOpen className="w-8 h-8 text-primary opacity-50" strokeWidth={1} />
          <div>
            <h4 className="text-sm font-bold text-foreground">Workhorses</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">High Vol / Low Margin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
