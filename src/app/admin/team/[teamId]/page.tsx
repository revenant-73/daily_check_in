import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getTeamDataForAdmin, getAdminData, assignToTeam } from "@/app/actions/admin";
import { LogOut, Users, Activity, TrendingUp, ChevronRight, ChevronLeft, UserMinus } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { TeamReadinessGraph } from "@/components/coach/TeamReadinessGraph";
import { ActionButton } from "@/components/admin/ActionButton";

export default async function TeamView(props: { params: Promise<{ teamId: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const teamData = await getTeamDataForAdmin(params.teamId);
  if (!teamData) notFound();

  const { team, players, checkIns, reviews, trends } = teamData;

  // We need organization name for breadcrumbs
  const adminData = await getAdminData();
  const organization = adminData.organizations.find((o: any) => o.id === team.orgId);

  const avgMental = checkIns.length > 0 
    ? (checkIns.reduce((acc: any, ci: any) => acc + ci.mentalRating, 0) / checkIns.length).toFixed(1) 
    : "N/A";
  const avgPhysical = checkIns.length > 0 
    ? (checkIns.reduce((acc: any, ci: any) => acc + ci.physicalRating, 0) / checkIns.length).toFixed(1) 
    : "N/A";
  const avgEmotional = checkIns.length > 0 
    ? (checkIns.reduce((acc: any, ci: any) => acc + ci.emotionalRating, 0) / checkIns.length).toFixed(1) 
    : "N/A";
  const avgPerformance = reviews.length > 0 
    ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "N/A";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Logo href="/admin" />
            <div className="hidden md:block h-8 w-px bg-border" />
            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              {organization && (
                <>
                  <Link href={`/admin/org/${organization.id}`} className="text-muted-foreground hover:text-foreground transition-colors">{organization.name}</Link>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </>
              )}
              <span className="text-foreground">{team.name}</span>
            </nav>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="space-y-2">
          <Link href={organization ? `/admin/org/${organization.id}` : "/admin"} className="inline-flex items-center text-sm font-bold text-primary hover:underline gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Back to Organization
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" /> {team.name}
              </h2>
              <p className="text-muted-foreground">Team Analytics and Player Management</p>
            </div>
            <div className="bg-muted px-4 py-2 rounded-xl border border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Invite Code</p>
              <code className="text-sm font-mono text-primary font-bold">{team.playerInviteCode}</code>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Activity className="w-4 h-4" />
              <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Mental</h3>
            </div>
            <p className="text-2xl font-black text-foreground">{avgMental}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Physical</h3>
            </div>
            <p className="text-2xl font-black text-foreground">{avgPhysical}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <Activity className="w-4 h-4" />
              <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Emotional</h3>
            </div>
            <p className="text-2xl font-black text-foreground">{avgEmotional}</p>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Star className="w-4 h-4 fill-yellow-500" />
              <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Avg Perf.</h3>
            </div>
            <p className="text-2xl font-black text-foreground">{avgPerformance}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TeamReadinessGraph data={trends} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              Players ({players.length})
            </h3>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
              {players.map(player => (
                <div key={player.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-foreground">{player.name || "Unknown"}</p>
                    <p className="text-[10px] text-muted-foreground">{player.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActionButton 
                      action={async () => {
                        "use server";
                        await assignToTeam(player.id, null);
                      }}
                      variant="ghost"
                      className="text-muted-foreground hover:text-red-500 p-2"
                      title="Unassign Player"
                    >
                      <UserMinus className="w-4 h-4" />
                    </ActionButton>
                    <Link href={`/coach/player/${player.id}`} className="text-primary p-2 hover:bg-primary/10 rounded-lg">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {players.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm italic">
                  No players on this team.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Recent Check-Ins</h3>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="p-4">Player</th>
                    <th className="p-4">Goal</th>
                    <th className="p-4 text-center">M/P/E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {checkIns.slice(0, 10).map((ci: any) => {
                    const player = players.find((p: any) => p.id === ci.playerId);
                    return (
                      <tr key={ci.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground">{player?.name?.split(' ')[0] || "Unknown"}</td>
                        <td className="p-4 text-muted-foreground truncate max-w-[150px]">{ci.goal}</td>
                        <td className="p-4 text-center">
                          <div className="flex gap-1 justify-center">
                            <span className="w-5 h-5 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">{ci.mentalRating}</span>
                            <span className="w-5 h-5 flex items-center justify-center bg-green-500/10 text-green-500 rounded text-[10px] font-bold">{ci.physicalRating}</span>
                            <span className="w-5 h-5 flex items-center justify-center bg-purple-500/10 text-purple-500 rounded text-[10px] font-bold">{ci.emotionalRating}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {checkIns.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground italic">No check-ins recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Recent Reviews</h3>
            <div className="space-y-3">
              {reviews.slice(0, 5).map((r: any) => {
                const player = players.find((p: any) => p.id === r.playerId);
                return (
                  <div key={r.id} className="p-4 bg-card rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-foreground">{player?.name || "Unknown"}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                        ))}
                      </div>
                    </div>
                    {r.notes && <p className="text-xs text-muted-foreground italic">&quot;{r.notes}&quot;</p>}
                  </div>
                );
              })}
              {reviews.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-sm italic text-sm">
                  No reviews recorded
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
