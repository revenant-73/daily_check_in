"use client";

import React from "react";

interface TrendData {
  date: Date | null;
  mental: number;
  physical: number;
  emotional: number;
  average: number;
}

export function ReadinessGraph({ data }: { data: TrendData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-sm">
        Not enough data for trends yet
      </div>
    );
  }

  const height = 150;
  const width = 400;
  const padding = 20;
  
  const maxValue = 10;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = height - (d.average / maxValue) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">7-Day Readiness Trend</h3>
      <div className="relative h-[150px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 2.5, 5, 7.5, 10].map((v) => {
            const y = height - (v / maxValue) * (height - padding * 2) - padding;
            return (
              <line 
                key={v} 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#f4f4f5" 
                strokeWidth="1" 
              />
            );
          })}
          
          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="#18181b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-sm"
          />
          
          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
            const y = height - (d.average / maxValue) * (height - padding * 2) - padding;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#18181b"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-2 px-4">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Older</span>
        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Today</span>
      </div>
    </div>
  );
}
