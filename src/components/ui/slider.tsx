"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
}

export function Slider({ label, value, className, ...props }: SliderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <label className="text-base font-bold text-zinc-900">{label}</label>
        <span className="text-lg font-black text-zinc-900 bg-zinc-100 px-3 py-1 rounded-xl min-w-[3rem] text-center">
          {value}
        </span>
      </div>
      <div className="relative flex items-center h-10">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          className="w-full h-4 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900"
          {...props}
        />
      </div>
      <div className="flex justify-between text-xs font-bold text-zinc-400 px-1 uppercase tracking-widest">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}
