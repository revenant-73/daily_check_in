"use client";

import React from "react";
import { Activity, Star, Users } from "lucide-react";

interface TeamStats {
  id: string;
  name: string;
  avgReadiness: number;
  avgPerformance: number;
  playerCount: number;
}

export function TeamsComparison({ teams }: { teams: TeamStats[] }) {
  if (teams.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/30">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Team Performance Overview
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Comparing readiness and performance ratings across all active teams.</p>
      </div>
      <div className="p-6 space-y-8">
        {teams.map((team) => (
          <div key={team.id} className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  {team.name}
                  <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {team.playerCount} players
                  </span>
                </h4>
              </div>
              <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-blue-500">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Readiness: {team.avgReadiness.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-3.5 h-3.5 fill-yellow-500" />
                  <span>Perf: {team.avgPerformance.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Readiness Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-black text-muted-foreground">
                  <span>Readiness</span>
                  <span>{Math.round(team.avgReadiness * 10)}%</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                    style={{ width: `${(team.avgReadiness / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Performance Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-black text-muted-foreground">
                  <span>Performance</span>
                  <span>{Math.round((team.avgPerformance / 5) * 100)}%</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-1000 ease-out"
                    style={{ width: `${(team.avgPerformance / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
