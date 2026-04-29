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

export function AttendanceList({ players }: { players: PlayerWithStatus[] }) {
  const checkedInCount = players.filter(p => p.hasCheckedInToday).length;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <h3 className="font-bold text-zinc-900 flex items-center gap-2">
          Today&apos;s Attendance
        </h3>
        <span className="text-xs font-black px-2 py-1 bg-zinc-900 text-white rounded-full">
          {checkedInCount} / {players.length}
        </span>
      </div>
      <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
        {players.map((player) => (
          <Link 
            key={player.id} 
            href={`/coach/player/${player.id}`}
            className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{player.name || "Unknown Player"}</p>
                <p className="text-[10px] text-zinc-400 font-medium">{player.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {player.hasCheckedInToday ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Checked In</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
                </div>
              )}
              <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
          </Link>
        ))}
        {players.length === 0 && (
          <div className="p-8 text-center text-zinc-400 text-sm">
            No players on this team yet.
          </div>
        )}
      </div>
    </div>
  );
}
