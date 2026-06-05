"use client";

import React, { useState, useTransition } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { submitCoachNote } from "@/app/actions/coach";
import { cn } from "@/lib/utils";

export function CoachNoteDialog({ 
  checkInId, 
  existingNote 
}: { 
  checkInId: string;
  existingNote?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(existingNote || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    startTransition(async () => {
      try {
        await submitCoachNote(checkInId, note);
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to submit note:", error);
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1.5 rounded-lg transition-all",
          existingNote 
            ? "bg-vibrant/10 text-vibrant" 
            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
        )}
        title={existingNote ? "Edit Coach Note" : "Add Coach Note"}
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 glass-card p-4 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Direct Note</span>
             <button onClick={() => setIsOpen(false)}><X className="w-3 h-3" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Encourage or nudge..."
              className="w-full bg-muted/50 border border-border p-2 rounded-xl text-xs focus:outline-none focus:border-primary min-h-[80px] text-foreground"
            />
            <button
              type="submit"
              disabled={isPending || !note.trim()}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {isPending ? "Syncing..." : "Send Note"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
