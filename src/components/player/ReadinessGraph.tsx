"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendData {
  date: Date | string | number | null;
  mental: number;
  physical: number;
  emotional: number;
  average: number;
}

export function ReadinessGraph({ data }: { data: TrendData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-muted/50 rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
        Not enough data for trends yet
      </div>
    );
  }

  const chartData = data.map((d, index) => {
    const date = d.date ? new Date(d.date) : null;
    const label = date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString(undefined, { weekday: "short" })
      : "??";
    const shortDate = date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
      : "Unknown date";
    const fullDate = date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
      : "Unknown date";

    return {
      xKey: date && !Number.isNaN(date.getTime()) ? `${date.getTime()}-${index}` : `unknown-${index}`,
      label,
      shortDate,
      fullDate,
      mental: d.mental,
      physical: d.physical,
      emotional: d.emotional,
      average: parseFloat(d.average.toFixed(1)),
    };
  });

  const getChartLabel = (value: unknown) => {
    const item = chartData.find((entry) => entry.xKey === value);
    return item ? `${item.label} ${item.shortDate}` : "";
  };

  const getTooltipLabel = (value: unknown) => {
    const item = chartData.find((entry) => entry.xKey === value);
    return item?.fullDate ?? "";
  };

  return (
    <div className="glass-card min-w-0 overflow-hidden rounded-3xl border border-border p-4 shadow-sm sm:rounded-[2.5rem] sm:p-6">
      <h3 className="mb-4 ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground sm:mb-6 sm:ml-2">7-Day Readiness Trend</h3>
      <div className="h-[240px] min-h-[240px] w-full min-w-0 sm:h-[250px] sm:min-h-[250px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={260}
          minHeight={220}
          debounce={50}
          initialDimension={{ width: 320, height: 240 }}
        >
          <LineChart data={chartData} margin={{ top: 5, right: 8, left: -26, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="xKey"
              tickFormatter={getChartLabel}
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 800, fill: "rgba(255,255,255,0.4)" }}
              dy={10}
            />
            <YAxis 
              domain={[0, 10]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 800, fill: "rgba(255,255,255,0.4)" }}
            />
            <Tooltip 
              labelFormatter={getTooltipLabel}
              contentStyle={{ 
                backgroundColor: "rgba(23, 23, 23, 0.9)", 
                border: "1px solid rgba(255, 255, 255, 0.1)", 
                borderRadius: "1rem",
                fontSize: "12px",
                fontWeight: "bold",
                backdropFilter: "blur(8px)"
              }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }}
            />
            <Line
              type="linear"
              dataKey="mental"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 4, fill: "#60a5fa" }}
              activeDot={{ r: 6 }}
              name="Mental"
            />
            <Line
              type="linear"
              dataKey="physical"
              stroke="#4ade80"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4ade80" }}
              activeDot={{ r: 6 }}
              name="Physical"
            />
            <Line
              type="linear"
              dataKey="emotional"
              stroke="#c084fc"
              strokeWidth={3}
              dot={{ r: 4, fill: "#c084fc" }}
              activeDot={{ r: 6 }}
              name="Emotional"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
