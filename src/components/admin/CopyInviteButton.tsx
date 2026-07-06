"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyInviteButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/onboarding?code=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest",
        copied 
          ? "bg-vibrant/20 text-vibrant" 
          : "bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
      title="Copy Direct Join Link"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied Link!
        </>
      ) : (
        <>
          <Share2 className="w-3 h-3" />
          Share Link
        </>
      )}
    </button>
  );
}
