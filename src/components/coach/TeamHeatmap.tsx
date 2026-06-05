"use client";

import React from "react";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ScatterChart, 
  Scatter, 
  Cell,
  ZAxis
} from "recharts";

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
  label: string;
}

export function TeamHeatmap({ data }: { data: any[] }) {
  // Process data for the last 7 days
  // For simplicity in this implementation, we'll map readiness types to Y axis
  // and days to X axis
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const metrics = ['Mental', 'Physical', 'Emotional'];

  const processedData = data.flatMap((entry, i) => {
    const date = new Date(entry.date);
    const dayName = days[date.getDay()];
    
    return [
      { x: dayName, y: 'Mental', value: entry.mental, label: 'Mental' },
      { x: dayName, y: 'Physical', value: entry.physical, label: 'Physical' },
      { x: dayName, y: 'Emotional', value: entry.emotional, label: 'Emotional' },
    ];
  });

  const getColor = (value: number) => {
    if (value <= 3) return "#ef4444"; // Red
    if (value <= 7) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Team Heatmap</h3>
          <p className="text-xs text-muted-foreground font-medium">Readiness intensity across metrics</p>
        </div>
        <div className="flex gap-4">
           {['Low', 'Mid', 'Peak'].map((l, i) => (
             <div key={l} className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  i === 0 ? "bg-red-500" : i === 1 ? "bg-yellow-500" : "bg-vibrant"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{l}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis 
              dataKey="x" 
              type="category" 
              name="Day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
            />
            <YAxis 
              dataKey="y" 
              type="category" 
              name="Metric" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
            />
            <ZAxis dataKey="value" range={[100, 800]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card p-3 rounded-2xl border-primary/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{data.x} • {data.y}</p>
                      <p className="text-xl font-black text-foreground">{data.value.toFixed(1)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Readiness" data={processedData}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.value)} fillOpacity={0.6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
