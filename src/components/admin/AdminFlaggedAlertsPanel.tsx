"use client";

import Link from "next/link";
import { AlertTriangle, BellRing, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminFlaggedCheckIn = {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goal: string;
  mentalRating: number;
  physicalRating: number;
  emotionalRating: number;
  createdAt?: Date | string | number | null;
};

type LowestReadiness = {
  label: "Mental" | "Physical" | "Emotional";
  value: number;
  color: string;
};

interface AdminFlaggedAlertsPanelProps {
  alerts: AdminFlaggedCheckIn[];
}

function getLowestReadiness(alert: AdminFlaggedCheckIn): LowestReadiness {
  const scores: LowestReadiness[] = [
    { label: "Mental", value: alert.mentalRating, color: "text-blue-300" },
    { label: "Physical", value: alert.physicalRating, color: "text-green-300" },
    { label: "Emotional", value: alert.emotionalRating, color: "text-purple-300" },
  ];

  return scores.reduce((lowest, score) => score.value < lowest.value ? score : lowest, scores[0]);
}

function formatAlertTime(value: AdminFlaggedCheckIn["createdAt"]) {
  if (!value) return "Recent";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function AdminFlaggedAlertsPanel({ alerts }: AdminFlaggedAlertsPanelProps) {
  const hasAlerts = alerts.length > 0;
  const visibleAlerts = alerts.slice(0, 6);

  return (
    <section
      aria-label="Global flagged check-ins"
      className={cn(
        "rounded-[2rem] border p-5 shadow-sm sm:p-6",
        hasAlerts
          ? "border-red-500/30 bg-red-950/20 shadow-red-950/20"
          : "border-border bg-card"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            <BellRing className={cn("h-4 w-4", hasAlerts ? "text-red-400" : "text-muted-foreground")} />
            Admin Alert Center
          </p>
          <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-foreground">
            Flagged Check-Ins
          </h3>
          <p className="mt-1 text-xs font-bold text-muted-foreground">
            Last 24 hours across all teams
          </p>
        </div>
        <div
          className={cn(
            "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 sm:w-auto sm:min-w-36 sm:flex-col sm:items-center sm:gap-1 sm:text-center",
            hasAlerts ? "border-red-500/30 bg-red-500/15" : "border-border bg-muted/40"
          )}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Flagged
          </p>
          <p className={cn("text-3xl font-black leading-none", hasAlerts ? "text-red-300" : "text-muted-foreground")}>
            {alerts.length}
          </p>
        </div>
      </div>

      {hasAlerts ? (
        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {visibleAlerts.map((alert) => {
            const lowest = getLowestReadiness(alert);

            return (
              <div
                key={alert.id}
                className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-background/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        {formatAlertTime(alert.createdAt)}
                      </span>
                      <Link
                        href={`/admin/team/${alert.teamId}`}
                        className="truncate text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        {alert.teamName}
                      </Link>
                    </div>
                    <p className="mt-2 truncate text-sm font-black text-foreground">
                      {alert.playerName}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs font-medium italic text-muted-foreground">
                      &quot;{alert.goal}&quot;
                    </p>
                  </div>
                  <div className="shrink-0 rounded-xl border border-red-500/20 bg-background/40 px-2.5 py-2 text-center">
                    <p className={cn("text-[9px] font-black uppercase tracking-wider", lowest.color)}>
                      {lowest.label}
                    </p>
                    <p className="text-xl font-black leading-none text-red-300">
                      {lowest.value}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/coach/player/${alert.playerId}`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-red-500/15 px-3 text-[10px] font-black uppercase tracking-widest text-red-200 transition-colors hover:bg-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Player
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/admin/team/${alert.teamId}`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-background/40 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Team
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
          <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            No flagged check-ins in the last 24 hours
          </p>
        </div>
      )}
    </section>
  );
}
