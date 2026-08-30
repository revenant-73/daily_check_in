import Link from "next/link";
import { AlertTriangle, BellRing, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FlaggedCheckIn = {
  id: string;
  playerId: string;
  goal: string;
  mentalRating: number;
  physicalRating: number;
  emotionalRating: number;
  createdAt?: Date | string | number | null;
};

type FlaggedPlayer = {
  id: string;
  name?: string | null;
};

type ReadinessCategory = "Mental" | "Physical" | "Emotional";

type LowestReadiness = {
  label: ReadinessCategory;
  value: number;
  color: string;
};

interface FlaggedCheckInsPanelProps {
  title: string;
  checkIns: FlaggedCheckIn[];
  players: FlaggedPlayer[];
  emptyMessage: string;
  profileHref: (playerId: string) => string;
  maxItems?: number;
  className?: string;
}

function getLowestReadiness(checkIn: FlaggedCheckIn): LowestReadiness {
  const scores: LowestReadiness[] = [
    { label: "Mental", value: checkIn.mentalRating, color: "text-blue-300" },
    { label: "Physical", value: checkIn.physicalRating, color: "text-green-300" },
    { label: "Emotional", value: checkIn.emotionalRating, color: "text-purple-300" },
  ];

  return scores.reduce((lowest, score) => score.value < lowest.value ? score : lowest, scores[0]);
}

function formatAlertTime(value: FlaggedCheckIn["createdAt"]) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function FlaggedCheckInsPanel({
  title,
  checkIns,
  players,
  emptyMessage,
  profileHref,
  maxItems = 5,
  className,
}: FlaggedCheckInsPanelProps) {
  const visibleCheckIns = checkIns.slice(0, maxItems);
  const hasAlerts = checkIns.length > 0;

  return (
    <section
      aria-label={title}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border p-5 shadow-sm sm:p-6",
        hasAlerts
          ? "border-red-500/30 bg-red-950/20 shadow-red-950/20"
          : "border-border bg-card",
        className
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            <BellRing className={cn("h-4 w-4", hasAlerts ? "text-red-400" : "text-muted-foreground")} />
            In-App Alert
          </p>
          <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-foreground sm:text-xl">
            {title}
          </h3>
        </div>
        <div
          className={cn(
            "shrink-0 rounded-2xl border px-3 py-2 text-center",
            hasAlerts ? "border-red-500/30 bg-red-500/15" : "border-border bg-muted/40"
          )}
        >
          <p className={cn("text-2xl font-black leading-none", hasAlerts ? "text-red-300" : "text-muted-foreground")}>
            {checkIns.length}
          </p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            Flagged
          </p>
        </div>
      </div>

      <div className="relative mt-5 space-y-3">
        {visibleCheckIns.map((checkIn) => {
          const player = players.find((item) => item.id === checkIn.playerId);
          const lowest = getLowestReadiness(checkIn);
          const alertTime = formatAlertTime(checkIn.createdAt);

          return (
            <Link
              key={checkIn.id}
              href={profileHref(checkIn.playerId)}
              className="group block rounded-2xl border border-red-500/20 bg-red-500/10 p-4 transition-colors hover:border-red-400/50 hover:bg-red-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-foreground">
                      {player?.name || "Unknown athlete"}
                    </p>
                    {alertTime && (
                      <span className="rounded-full bg-background/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        {alertTime}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium italic text-muted-foreground">
                    &quot;{checkIn.goal}&quot;
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="rounded-xl border border-red-500/20 bg-background/40 px-2.5 py-2 text-center">
                    <p className={cn("text-[9px] font-black uppercase tracking-wider", lowest.color)}>
                      {lowest.label}
                    </p>
                    <p className="text-xl font-black leading-none text-red-300">
                      {lowest.value}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-red-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}

        {!hasAlerts && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
            <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
