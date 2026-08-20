"use client";

import React, { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
  id: string;
  action: (id: string) => Promise<void>;
  confirmMessage?: string;
  className?: string;
  icon: React.ReactNode;
  label?: string;
}

export function ActionButton({ 
  id, 
  action, 
  confirmMessage, 
  className = "", 
  icon,
  label
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (!confirmMessage || window.confirm(confirmMessage)) {
      startTransition(async () => {
        try {
          await action(id);
        } catch (error) {
          console.error("Action failed:", error);
          alert("Action failed. Please try again.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`min-h-11 rounded-lg px-3 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 ${className}`}
      aria-label={label || "Action"}
      title={label || "Action"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon
      )}
      {label && <span className="text-xs font-bold uppercase tracking-wider">{label}</span>}
    </button>
  );
}
