import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamData, getTeamReadinessTrends } from "@/app/actions/coach";
import { TeamReadinessGraph } from "@/components/coach/TeamReadinessGraph";
import { AttendanceList } from "@/components/coach/AttendanceList";
import { TeamQRCode } from "@/components/coach/TeamQRCode";
import { ReactionButtons } from "@/components/coach/ReactionButtons";
import { TeamHeatmap } from "@/components/coach/TeamHeatmap";
import { ActivityFeed } from "@/components/coach/ActivityFeed";
import { CoachNoteDialog } from "@/components/coach/CoachNoteDialog";
import { Users, Activity, TrendingUp, Zap, Target, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export default async function CoachDashboard(props: {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/login");
  }

  let data;
  let trends: any[] = [];
  try {
    data = await getTeamData();
    trends = await getTeamReadinessTrends();
  } catch (error) {
    console.error("Error fetching coach dashboard data:", error);
    throw error;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Team Assigned</h1>
          <p className="text-zinc-500 mt-2">Please ask an admin to assign you to a team.</p>
          <Link href="/api/auth/signout" className="mt-4 inline-block text-primary font-bold">Sign Out</Link>
        </div>
      </div>
    );
  }

  const { team, players, checkIns, reviews, reactions, prevAvg, criticalPlayers } = data;

  // Simple stats
  const avgMental = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ci.mentalRating, 0) / checkIns.length) : null;
  const avgPhysical = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ci.physicalRating, 0) / checkIns.length) : null;
  const avgEmotional = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ci.emotionalRating, 0) / checkIns.length) : null;
  const avgPerformance = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "N/A";

  const getDelta = (current: number | null, prev: number | undefined) => {
    if (current === null || prev === undefined) return null;
    const diff = current - prev;
    if (Math.abs(diff) < 0.1) return null;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0,
      isNegative: diff < 0
    };
  };

  const mentalDelta = getDelta(avgMental, prevAvg?.mental);
  const physicalDelta = getDelta(avgPhysical, prevAvg?.physical);
  const emotionalDelta = getDelta(avgEmotional, prevAvg?.emotional);

  // Combine for Activity Feed
  const feedActivities = [
    ...checkIns
      .filter(ci => ci.createdAt !== null)
      .map(ci => ({
        id: ci.id,
        playerName: players.find(p => p.id === ci.playerId)?.name || "Athlete",
        type: 'check-in' as const,
        goal: ci.goal,
        readiness: ci.physicalRating,
        timestamp: ci.createdAt as Date
      })),
    ...reviews
      .filter(r => r.createdAt !== null)
      .map(r => ({
        id: r.id,
        playerName: players.find(p => p.id === r.playerId)?.name || "Athlete",
        type: 'review' as const,
        timestamp: r.createdAt as Date
      }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getStatusBadge = (ci: any) => {
    if (ci.physicalRating <= 3) return { label: 'FATIGUED', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    if (ci.mentalRating <= 3) return { label: 'UNFOCUSED', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    if (ci.physicalRating >= 8 && ci.mentalRating >= 8) return { label: 'READY', color: 'bg-vibrant/10 text-vibrant border-vibrant/20' };
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <Header 
        userName={session.user.name} 
        role="Coach" 
        teamName={team?.name} 
        href="/coach/dashboard"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">
              COACH {session.user.name?.split(' ')[0]}
            </h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
              Directing <span className="text-primary font-black">{team?.name}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <TeamQRCode teamName={team?.name || ""} />
            <AttendanceList players={players} inviteCode={team?.playerInviteCode || undefined} variant="condensed" />
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Avg Mental', val: avgMental, delta: mentalDelta, color: 'text-blue-400', icon: Brain },
            { label: 'Avg Physical', val: avgPhysical, delta: physicalDelta, color: 'text-green-400', icon: Activity },
            { label: 'Avg Emotional', val: avgEmotional, delta: emotionalDelta, color: 'text-purple-400', icon: Heart },
            { label: 'Performance', val: parseFloat(avgPerformance as string) || 0, delta: null, color: 'text-yellow-400', icon: Target }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
               <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-2 rounded-xl bg-muted/50", stat.color)}>
                    {stat.icon && <stat.icon className="w-5 h-5" />}
                  </div>
                  {stat.delta && (
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full",
                      stat.delta.isPositive ? "bg-vibrant/10 text-vibrant" : "bg-red-500/10 text-red-500"
                    )}>
                      {stat.delta.isPositive ? '↑' : '↓'} {stat.delta.value}
                    </span>
                  )}
               </div>
               <div className="text-3xl font-black tabular-nums">{stat.val ? stat.val.toFixed(1) : 'N/A'}</div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Critical Insights / Alarm Players */}
              <section className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <AlertTriangle className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-500" /> Critical Insights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criticalPlayers && criticalPlayers.length > 0 ? (
                    criticalPlayers.map((player: any) => (
                      <Link 
                        key={player.id} 
                        href={`/coach/player/${player.id}`}
                        className="p-4 rounded-3xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-black text-sm uppercase tracking-tight group-hover:text-red-500 transition-colors">{player.name}</p>
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full border",
                            player.status === 'LOW' ? "bg-red-500 text-white border-red-600" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {player.status}
                          </span>
                        </div>
                        <div className="flex items-end gap-3">
                          <div className="text-2xl font-black text-foreground">{(player.currentScore * 10).toFixed(0)}%</div>
                          <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">
                            Down from {(player.prevScore * 10).toFixed(0)}%
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center bg-muted/20 rounded-3xl border border-dashed border-border/50">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No critical alerts today</p>
                    </div>
                  )}
                </div>
              </section>
              
              <section className="glass-card rounded-3xl sm:rounded-[2.5rem] overflow-hidden">
                <div className="p-5 sm:p-8 border-b border-border/50 flex justify-between items-center">
                  <h3 className="text-sm sm:text-xl font-black uppercase tracking-widest">Recent Check-Ins</h3>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border/50">
                  {checkIns.slice(0, 8).map((ci) => {
                    const player = players.find(p => p.id === ci.playerId);
                    const status = getStatusBadge(ci);
                    const ciReactions = reactions?.filter((r: any) => r.checkInId === ci.id) || [];
                    const metadata = ci.metadata ? JSON.parse(ci.metadata) : {};
                    return (
                      <div key={ci.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <Link href={`/coach/player/${ci.playerId}`} className="font-black text-sm text-foreground uppercase tracking-tight">
                            {player?.name || "Unknown"}
                          </Link>
                          {status && (
                            <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest", status.color)}>
                              {status.label}
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium italic">&quot;{ci.goal}&quot;</p>
                        <div className="flex justify-between items-center pt-1">
                          <div className="flex gap-1">
                            <div className={cn("w-1.5 h-1.5 rounded-full", ci.mentalRating <= 3 ? "bg-red-500" : "bg-blue-400/20")} />
                            <div className={cn("w-1.5 h-1.5 rounded-full", ci.physicalRating <= 3 ? "bg-red-500" : "bg-green-400/20")} />
                          </div>
                          <div className="flex gap-2 items-center scale-90 origin-right">
                            <CoachNoteDialog checkInId={ci.id} existingNote={metadata.coachNote} />
                            <ReactionButtons checkInId={ci.id} currentReactions={ciReactions} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border/50">
                        <th className="p-6">Player</th>
                        <th className="p-6">Intent</th>
                        <th className="p-6 text-center">Status</th>
                        <th className="p-6 text-right">React</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {checkIns.slice(0, 8).map((ci) => {
                        const player = players.find(p => p.id === ci.playerId);
                        const status = getStatusBadge(ci);
                        const ciReactions = reactions?.filter((r: any) => r.checkInId === ci.id) || [];
                        const metadata = ci.metadata ? JSON.parse(ci.metadata) : {};
                        return (
                          <tr key={ci.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="p-6">
                              <Link href={`/coach/player/${ci.playerId}`} className="font-black text-sm text-foreground hover:text-primary transition-colors uppercase tracking-tight">
                                {player?.name?.split(' ')[0] || "Unknown"}
                              </Link>
                            </td>
                            <td className="p-6">
                               <p className="text-xs text-muted-foreground font-medium line-clamp-1">{ci.goal}</p>
                            </td>
                            <td className="p-6">
                              <div className="flex justify-center">
                                {status ? (
                                  <div className={cn("px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest", status.color)}>
                                    {status.label}
                                  </div>
                                ) : (
                                  <div className="flex gap-1">
                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-400/40" />
                                     <div className="w-1.5 h-1.5 rounded-full bg-purple-400/40" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-6 text-right">
                              <div className="flex justify-end gap-3 items-center">
                                <CoachNoteDialog checkInId={ci.id} existingNote={metadata.coachNote} />
                                <ReactionButtons checkInId={ci.id} currentReactions={ciReactions} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
           </div>

           <div className="space-y-8">
              <ActivityFeed activities={feedActivities.slice(0, 15)} />
              
              {/* Team Readiness Trends Summary */}
              <div className="glass-card rounded-[2.5rem] p-8">
                 <h3 className="text-lg font-black uppercase tracking-widest mb-6">Readiness Trends</h3>
                 <TeamReadinessGraph data={trends} />
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

import { Brain, Heart } from "lucide-react";

function Star({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
