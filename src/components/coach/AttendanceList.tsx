"use client";

import React from "react";
import { CheckCircle2, Clock, User, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PlayerWithStatus {
  id: string;
  name: string | null;
  email: string;
  hasCheckedInToday: boolean | null;
  latestReadiness: number | null;
}

export function AttendanceList({ players, inviteCode, variant = "default" }: { players: PlayerWithStatus[], inviteCode?: string, variant?: "default" | "condensed" }) {
  const checkedInCount = players.filter(p => !!p.hasCheckedInToday).length;

  if (variant === "condensed") {
    return (
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3 py-1 sm:gap-6">
          <div className="flex min-w-0 items-center gap-2 pr-3 sm:border-r sm:border-border sm:pr-4">
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Attendance
            </h3>
            <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full">
              {checkedInCount}/{players.length}
            </span>
          </div>
          
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 pr-0 sm:pr-4">
            {players.map((player) => {
              const isCheckedIn = !!player.hasCheckedInToday;
              const isLowReadiness = isCheckedIn && player.latestReadiness !== null && player.latestReadiness < 4;
              return (
                <Link 
                  key={player.id} 
                  href={`/coach/player/${player.id}`}
                  className="flex min-h-7 items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-80"
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                    isLowReadiness 
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' 
                      : isCheckedIn 
                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
                        : 'bg-amber-500/40'
                  }`} />
                  <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tight ${
                    isLowReadiness 
                      ? 'text-red-500' 
                      : isCheckedIn 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                  }`}>
                    {player.name?.split(' ')[0] || "Unknown"}
                  </span>
                </Link>
              );
            })}
            {players.length === 0 && (
              <span className="text-[10px] text-muted-foreground italic uppercase">No players</span>
            )}
          </div>

          {inviteCode && (
            <div className="min-w-0 border-border sm:border-l sm:pl-4">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mr-2">Code:</span>
              <code className="text-[10px] font-mono text-primary font-bold select-all bg-primary/5 px-1.5 py-0.5 rounded uppercase">{inviteCode}</code>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          Today&apos;s Attendance
        </h3>
        <span className="text-xs font-black px-2 py-1 bg-primary text-primary-foreground rounded-full">
          {checkedInCount} / {players.length}
        </span>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {players.map((player) => {
          const isCheckedIn = !!player.hasCheckedInToday;
          const isLowReadiness = isCheckedIn && player.latestReadiness !== null && player.latestReadiness < 4;
          return (
            <Link 
              key={player.id} 
              href={`/coach/player/${player.id}`}
              className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group ${isLowReadiness ? 'bg-red-500/5' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isLowReadiness 
                    ? 'bg-red-500 text-white' 
                    : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                }`}>
                  {isLowReadiness ? <AlertTriangle className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isLowReadiness ? 'text-red-600' : 'text-foreground'}`}>
                    {player.name || "Unknown Player"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">{player.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isLowReadiness ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Low Readiness</span>
                  </div>
                ) : isCheckedIn ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Checked In</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
                  </div>
                )}
                <ChevronRight className={`w-4 h-4 transition-colors ${isLowReadiness ? 'text-red-400' : 'text-muted-foreground group-hover:text-foreground'}`} />
              </div>
            </Link>
          );
        })}
        {players.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No players on this team yet.
          </div>
        )}
      </div>
    </div>
  );
}
