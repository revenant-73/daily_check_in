"use client";

import React from "react";
import { UserMinus, User, CheckCircle2, Clock } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { assignToTeam } from "@/app/actions/admin";

interface PlayerWithStatus {
  id: string;
  name: string | null;
  email: string;
  hasCheckedInToday: boolean;
}

export function PlayerManagementList({ players }: { players: PlayerWithStatus[] }) {
  const checkedInCount = players.filter(p => p.hasCheckedInToday).length;

  const handleUnassign = async (userId: string) => {
    await assignToTeam(userId, null);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          Team Roster & Attendance
        </h3>
        <span className="text-xs font-black px-2 py-1 bg-primary text-primary-foreground rounded-full">
          {checkedInCount} / {players.length}
        </span>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {players.map((player) => (
          <div 
            key={player.id} 
            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
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
            
            <div className="flex items-center gap-3">
              {player.hasCheckedInToday ? (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-wider">In</span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-wider">Out</span>
                </div>
              )}
              
              <ActionButton 
                id={player.id}
                action={handleUnassign}
                confirmMessage={`Are you sure you want to unassign ${player.name || player.email} from this team?`}
                icon={<UserMinus className="w-4 h-4" />}
                label="Unassign"
                className="text-muted-foreground hover:text-amber-500"
              />
            </div>
          </div>
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
