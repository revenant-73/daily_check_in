"use client";

import React, { useTransition } from "react";
import { addReaction } from "@/app/actions/coach";

const REACTION_TYPES = [
  { type: "high-five", emoji: "✋" },
  { type: "fire", emoji: "🔥" },
  { type: "muscle", emoji: "💪" },
  { type: "target", emoji: "🎯" },
];

interface Reaction {
  id: string;
  checkInId: string;
  type: string;
}

export function ReactionButtons({ 
  checkInId, 
  currentReactions 
}: { 
  checkInId: string, 
  currentReactions: Reaction[] 
}) {
  const [isPending, startTransition] = useTransition();

  const handleReaction = (type: string) => {
    startTransition(async () => {
      try {
        await addReaction(checkInId, type);
      } catch (error) {
        console.error("Failed to add reaction:", error);
      }
    });
  };

  return (
    <div className="flex gap-1">
      {REACTION_TYPES.map((rt) => {
        const count = currentReactions.filter(r => r.type === rt.type).length;
        const isActive = currentReactions.some(r => r.type === rt.type); // Simplified: check if ANY coach reacted (could be refined to current user)

        return (
          <button
            key={rt.type}
            onClick={() => handleReaction(rt.type)}
            disabled={isPending}
            className={`flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
              isActive 
                ? 'bg-primary/20 border-primary/40 text-primary scale-105 shadow-sm' 
                : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-border-hover'
            }`}
            aria-pressed={isActive}
            aria-label={`React with ${rt.type}`}
            title={`React with ${rt.type}`}
          >
            <span>{rt.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
