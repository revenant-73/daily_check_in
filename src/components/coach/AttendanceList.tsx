"use client";

import React from "react";
import { CheckCircle2, Clock, User, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PlayerWithStatus {
  id: string;
  name: string | null;
  email: string;
  hasCheckedInToday: boolean;
}

export function AttendanceList({ players, inviteCode, variant = "default" }: { players: PlayerWithStatus[], inviteCode?: string, variant?: "default" | "condensed" }) {
  const checkedInCount = players.filter(p => p.hasCheckedInToday).length;

  if (variant === "condensed") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-3 pr-4 border-r border-border">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Attendance
            </h3>
            <span className="text-[10px] font-black px-2 py-0.5 bg-primary/20 text-primary rounded-full">
              {checkedInCount}/{players.length}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1">
            {players.map((player) => (
              <Link 
                key={player.id} 
                href={`/coach/player/${player.id}`}
                className="flex items-center gap-1.5 group hover:opacity-80 transition-opacity"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${player.hasCheckedInToday ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-amber-500/40'}`} />
                <span className={`text-xs font-bold ${player.hasCheckedInToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {player.name?.split(' ')[0] || "Unknown"}
                </span>
              </Link>
            ))}
            {players.length === 0 && (
              <span className="text-xs text-muted-foreground italic">No players joined yet.</span>
            )}
          </div>

          {inviteCode && (
            <div className="pl-4 border-l border-border hidden sm:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Invite Code</p>
              <code className="text-xs font-mono text-primary font-bold select-all bg-primary/5 px-1.5 py-0.5 rounded">{inviteCode}</code>
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
        {players.map((player) => (
          <Link 
            key={player.id} 
            href={`/coach/player/${player.id}`}
            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{player.name || "Unknown Player"}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{player.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {player.hasCheckedInToday ? (
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
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </Link>
        ))}
        {players.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No players on this team yet.
          </div>
        )}
      </div>
    </div>
  );
}
