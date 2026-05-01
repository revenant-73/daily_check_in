"use client";

import React, { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => Promise<void>;
  confirmMessage?: string;
  className?: string;
}

export function DeleteButton({ id, onDelete, confirmMessage = "Are you sure you want to delete this?", className = "" }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (window.confirm(confirmMessage)) {
      startTransition(async () => {
        try {
          await onDelete(id);
        } catch (error) {
          console.error("Delete failed:", error);
          alert("Failed to delete. Please try again.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 ${className}`}
      aria-label="Delete"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
