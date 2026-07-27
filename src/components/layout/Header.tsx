import React from "react";
import Link from "next/link";
import { LogOut, MessageSquare, Flame } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userName?: string | null;
  role?: string;
  teamName?: string;
  href?: string;
  feedbackUrl?: string;
  streak?: number;
}

export function Header({ 
  userName, 
  role, 
  teamName, 
  href = "/dashboard",
  feedbackUrl = "/feedback",
  streak
}: HeaderProps) {

  return (
    <header className="bg-card border-b border-border p-3 sm:p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4 sm:gap-6">
          <Logo href={href} />
          <div className="hidden md:block h-6 w-px bg-border" />
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-foreground capitalize">{role} Dashboard</h1>
            {teamName && (
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{teamName}</p>
            )}
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex gap-1.5 sm:gap-4 items-center">
          {streak !== undefined && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 font-black text-[11px] sm:text-sm tracking-tighter shadow-[0_0_10px_rgba(249,115,22,0.1)]">
              <Flame className={cn("w-4 h-4 fill-orange-500", streak > 0 ? "animate-pulse" : "opacity-50")} />
              <span>{streak}</span>
            </div>
          )}
          <Link
            href={feedbackUrl}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-vibrant/10 text-vibrant border border-vibrant/20 hover:bg-vibrant/20 transition-all font-black text-[10px] uppercase tracking-widest"
            title="Give Feedback"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Feedback</span>
          </Link>
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-foreground">{userName || "User"}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">{role}</span>
          </div>
          <Link 
            href="/api/auth/signout"
            className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg flex items-center gap-2"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
