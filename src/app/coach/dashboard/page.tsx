import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamData, getTeamReadinessTrends } from "@/app/actions/coach";
import { TeamReadinessGraph } from "@/components/coach/TeamReadinessGraph";
import { AttendanceList } from "@/components/coach/AttendanceList";
import { ReactionButtons } from "@/components/coach/ReactionButtons";
import { Users, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

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

  const { team, players, checkIns, reviews, reactions, prevAvg } = data;

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <Header 
        userName={session.user.name} 
        role="Coach" 
        teamName={team?.name} 
        href="/coach/dashboard"
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <header className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground">
                Hi Coach {session.user.name?.split(' ')[0]},
              </h2>
              <p className="text-sm text-muted-foreground">
                Current data for <span className="text-primary font-bold">{team?.name}</span>
              </p>
            </div>
          </div>
          
          <AttendanceList players={players} inviteCode={team?.playerInviteCode || undefined} variant="condensed" />
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-blue-500">
                <Activity className="w-4 h-4" />
                <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Mental</h3>
              </div>
              {mentalDelta && (
                <span className={`text-[10px] font-bold ${mentalDelta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {mentalDelta.isPositive ? '↑' : '↓'} {mentalDelta.value}
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-foreground">{avgMental ? avgMental.toFixed(1) : "N/A"}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Physical</h3>
              </div>
              {physicalDelta && (
                <span className={`text-[10px] font-bold ${physicalDelta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {physicalDelta.isPositive ? '↑' : '↓'} {physicalDelta.value}
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-foreground">{avgPhysical ? avgPhysical.toFixed(1) : "N/A"}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-purple-500">
                <Activity className="w-4 h-4" />
                <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Emotional</h3>
              </div>
              {emotionalDelta && (
                <span className={`text-[10px] font-bold ${emotionalDelta.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {emotionalDelta.isPositive ? '↑' : '↓'} {emotionalDelta.value}
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-foreground">{avgEmotional ? avgEmotional.toFixed(1) : "N/A"}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Users className="w-4 h-4" />
              <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Performance</h3>
            </div>
            <p className="text-2xl font-black text-foreground">{avgPerformance}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TeamReadinessGraph data={trends} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Recent Check-Ins</h2>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="p-3">Player</th>
                    <th className="p-3">Goal</th>
                    <th className="p-3 text-center">Readiness</th>
                    <th className="p-3 text-right">React</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {checkIns.slice(0, 8).map((ci) => {
                    const player = players.find(p => p.id === ci.playerId);
                    const ciReactions = reactions?.filter((r: any) => r.checkInId === ci.id) || [];
                    return (
                      <tr key={ci.id} className="hover:bg-muted/50 transition-colors group">
                        <td className="p-3">
                          <Link href={`/coach/player/${ci.playerId}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                            {player?.name?.split(' ')[0] || "Unknown"}
                          </Link>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground truncate max-w-[150px]">{ci.goal}</td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
                             <span className="w-5 h-5 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold" title="Mental">{ci.mentalRating}</span>
                             <span className="w-5 h-5 flex items-center justify-center bg-green-500/10 text-green-500 rounded text-[10px] font-bold" title="Physical">{ci.physicalRating}</span>
                             <span className="w-5 h-5 flex items-center justify-center bg-purple-500/10 text-purple-500 rounded text-[10px] font-bold" title="Emotional">{ci.emotionalRating}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end">
                            <ReactionButtons checkInId={ci.id} currentReactions={ciReactions} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {checkIns.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-xs text-muted-foreground">No check-ins today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Recent Reviews</h2>
             <div className="grid grid-cols-1 gap-3">
               {reviews.slice(0, 4).map((r) => {
                 const player = players.find(p => p.id === r.playerId);
                 return (
                   <div key={r.id} className="p-4 bg-card rounded-xl border border-border shadow-sm">
                     <div className="flex justify-between items-center mb-1">
                       <Link href={`/coach/player/${r.playerId}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors">
                        {player?.name?.split(' ')[0] || "Unknown"}
                       </Link>
                       <div className="flex gap-0.5">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                         ))}
                       </div>
                     </div>
                     {r.notes && <p className="text-xs text-muted-foreground line-clamp-2 italic">&quot;{r.notes}&quot;</p>}
                     <p className="text-[9px] text-muted-foreground mt-1 uppercase font-bold tracking-widest text-right">
                       {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                     </p>
                   </div>
                 );
               })}
                {reviews.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border shadow-sm">
                    No reviews yet
                  </div>
                )}
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}

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
