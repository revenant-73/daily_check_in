"use client";

import React, { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => Promise<void>;
  confirmMessage?: string;
  className?: string;
  size?: "sm" | "md";
}

export function DeleteButton({ 
  id, 
  onDelete, 
  confirmMessage = "Are you sure you want to delete this?", 
  className = "",
  size = "md"
}: DeleteButtonProps) {
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

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 ${size === "sm" ? "p-2" : "p-2.5"} ${className}`}
      aria-label="Delete"
      title="Delete"
    >
      {isPending ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <Trash2 className={iconSize} />
      )}
    </button>
  );
}
