"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  value: number;
}

export function Slider({ label, description, value, className, ...props }: SliderProps) {
  // Calculate color based on value (1-10)
  const getGradient = (val: number) => {
    const percentage = ((val - 1) / 9) * 100;
    return `linear-gradient(90deg, #ef4444 0%, #eab308 50%, #22c55e 100%)`;
  };

  const getTrackBackground = (val: number) => {
    const percentage = ((val - 1) / 9) * 100;
    return {
      background: `linear-gradient(to right, currentColor 0%, currentColor ${percentage}%, var(--muted) ${percentage}%, var(--muted) 100%)`
    };
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">{label}</label>
          {description && (
            <p className="text-[10px] font-bold text-muted-foreground/60 leading-tight max-w-[200px]">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
           <span className={cn(
             "text-2xl font-black px-4 py-1 rounded-2xl min-w-[3.5rem] text-center transition-colors",
             value <= 3 ? "text-red-500 bg-red-500/10" : 
             value <= 7 ? "text-yellow-500 bg-yellow-500/10" : 
             "text-vibrant bg-vibrant/10"
           )}>
            {value}
          </span>
        </div>
      </div>
      <div className="relative group py-2">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          style={{
            background: `linear-gradient(to right, ${value <= 3 ? '#ef4444' : value <= 7 ? '#eab308' : '#22c55e'} 0%, #1e293b ${((value-1)/9)*100}%, #1e293b 100%)`
          }}
          className="w-full h-3 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-lg active:[&::-webkit-slider-thumb]:scale-110 transition-all"
          {...props}
        />
      </div>
      <div className="flex justify-between text-[10px] font-black text-muted-foreground px-1 uppercase tracking-[0.2em]">
        <span>Minimum</span>
        <span>Peak Performance</span>
      </div>
    </div>
  );
}
