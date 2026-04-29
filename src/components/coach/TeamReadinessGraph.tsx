"use client";

import React from "react";

interface TeamTrendData {
  date: string;
  average: number;
}

export function TeamReadinessGraph({ data }: { data: TeamTrendData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-white rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-sm">
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
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">Team Readiness Trend (Last 7 Sessions)</h3>
      <div className="relative h-[180px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 5, 10].map((v) => {
            const y = height - (v / maxValue) * (height - padding * 2) - padding;
            return (
              <g key={v}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f4f4f5" strokeWidth="1" />
                <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-zinc-400 font-bold">{v}</text>
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
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="#18181b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          
          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
            const y = height - (d.average / maxValue) * (height - padding * 2) - padding;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="white" stroke="#18181b" strokeWidth="3" />
                <text 
                  x={x} 
                  y={height - 5} 
                  textAnchor="middle" 
                  className="text-[8px] fill-zinc-400 font-black uppercase"
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
