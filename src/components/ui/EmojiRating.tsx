"use client";

import React from "react";
import { cn, hapticFeedback } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmojiRatingProps {
  label: string;
  description?: string;
  value: number; // 1-10 scale
  onChange: (val: number) => void;
}

const EMOJIS = [
  { char: "😫", label: "Exhausted", value: 2 },
  { char: "🫤", label: "Low", value: 4 },
  { char: "🙂", label: "Good", value: 6 },
  { char: "😁", label: "High", value: 8 },
  { char: "🔥", label: "Elite", value: 10 },
];

export function EmojiRating({ label, description, value, onChange }: EmojiRatingProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-black text-muted-foreground uppercase tracking-widest">{label}</label>
        {description && (
          <p className="text-[10px] font-bold text-muted-foreground/60 leading-tight max-w-[250px]">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex justify-between items-center gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji.value}
            type="button"
            onClick={() => {
              hapticFeedback("light");
              onChange(emoji.value);
            }}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
              value === emoji.value 
                ? "bg-primary/10 border-primary scale-110" 
                : "bg-muted/30 border-transparent hover:bg-muted/50"
            )}
          >
            <span className="text-2xl sm:text-3xl">{emoji.char}</span>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter",
              value === emoji.value ? "text-primary" : "text-muted-foreground"
            )}>
              {emoji.label}
            </span>
            {value === emoji.value && (
              <motion.div 
                layoutId={`active-dot-${label}`}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
