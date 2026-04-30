"use client";

import React from "react";

interface TeamTrendData {
  date: string;
  average: number;
}

export function TeamReadinessGraph({ data }: { data: TeamTrendData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-card rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
        No team data available for trends
      </div>
    );
  }

  const height = 150;
  const width = 600;
  const padding = 30;
  
  const maxValue = 10;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = height - (d.average / maxValue) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Team Readiness Trend (Last 7 Sessions)</h3>
      <div className="relative h-[180px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 5, 10].map((v) => {
            const y = height - (v / maxValue) * (height - padding * 2) - padding;
            return (
              <g key={v}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeWidth="1" className="text-border/50" />
                <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-muted-foreground font-bold">{v}</text>
              </g>
            );
          })}
          
          {/* Area under line */}
          <path
            d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
            fill="url(#gradient)"
            opacity="0.1"
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" className="text-primary" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
            </linearGradient>
          </defs>

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="text-primary"
          />
          
          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
            const y = height - (d.average / maxValue) * (height - padding * 2) - padding;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="currentColor" stroke="currentColor" strokeWidth="3" className="text-card stroke-primary" />
                <text 
                  x={x} 
                  y={height - 5} 
                  textAnchor="middle" 
                  className="text-[8px] fill-muted-foreground font-black uppercase"
                >
                  {d.date.split('/')[0]}/{d.date.split('/')[1]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
