"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TeamTrendData {
  date: string;
  mental: number;
  physical: number;
  emotional: number;
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

  const chartData = data.map((d, index) => {
    const date = new Date(d.date);
    const hasValidDate = !Number.isNaN(date.getTime());
    const shortDate = hasValidDate
      ? date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" })
      : d.date;
    const fullDate = hasValidDate
      ? date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
      : d.date;

    return {
      xKey: hasValidDate ? `${date.getTime()}-${index}` : `${d.date}-${index}`,
      shortDate,
      fullDate,
      mental: Number(d.mental.toFixed(1)),
      physical: Number(d.physical.toFixed(1)),
      emotional: Number(d.emotional.toFixed(1)),
      average: Number(d.average.toFixed(1)),
    };
  });

  const getChartLabel = (value: unknown) => {
    const item = chartData.find((entry) => entry.xKey === value);
    return item?.shortDate ?? "";
  };

  const getTooltipLabel = (value: unknown) => {
    const item = chartData.find((entry) => entry.xKey === value);
    return item?.fullDate ?? "";
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground sm:mb-6">
        Team Readiness Trend (Last 7 Sessions)
      </h3>
      <div className="relative h-[220px] min-h-[220px] w-full min-w-0 sm:h-[210px] sm:min-h-[210px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={260}
          minHeight={200}
          debounce={50}
          initialDimension={{ width: 320, height: 220 }}
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
                backdropFilter: "blur(8px)",
              }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                paddingBottom: "20px",
              }}
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
