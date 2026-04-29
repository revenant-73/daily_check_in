"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
}

export function Slider({ label, value, className, ...props }: SliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-zinc-700">{label}</label>
        <span className="text-sm font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded">
          {value}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
        {...props}
      />
      <div className="flex justify-between text-[10px] text-zinc-400 px-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
