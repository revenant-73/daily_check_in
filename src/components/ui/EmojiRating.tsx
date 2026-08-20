"use client";

import React from "react";
import { cn, hapticFeedback } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmojiRatingProps {
  label: string;
  description?: string;
  value: number; // 1-10 scale
  onChange: (val: number) => void;
  variant?: "default" | "compact";
}

const EMOJIS = [
  { char: "😫", label: "Exhausted", value: 2 },
  { char: "🫤", label: "Low", value: 4 },
  { char: "🙂", label: "Good", value: 6 },
  { char: "😁", label: "High", value: 8 },
  { char: "🔥", label: "Elite", value: 10 },
];

export function EmojiRating({ label, description, value, onChange, variant = "default" }: EmojiRatingProps) {
  const selected = EMOJIS.find((emoji) => emoji.value === value) || EMOJIS[2];

  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-border bg-muted/20 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="text-xs font-black text-foreground uppercase tracking-widest">{label}</label>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
            {selected.label}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji.value}
              type="button"
              aria-label={`${label}: ${emoji.label}`}
              title={emoji.label}
              onClick={() => {
                hapticFeedback("light");
                onChange(emoji.value);
              }}
              className={cn(
                "flex min-h-12 items-center justify-center rounded-xl border-2 text-xl transition-all sm:min-h-14 sm:text-2xl",
                value === emoji.value
                  ? "scale-105 border-primary bg-primary/15 shadow-md shadow-primary/10"
                  : "border-transparent bg-background/40 hover:bg-muted/60"
              )}
            >
              <span aria-hidden="true">{emoji.char}</span>
            </button>
          ))}
        </div>

        {description && (
          <p className="mt-2 hidden text-xs font-bold leading-tight text-muted-foreground/60 sm:block">
            {description}
          </p>
        )}
      </div>
    );
  }

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
