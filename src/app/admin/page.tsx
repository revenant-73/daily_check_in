import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminData, createOrganization, updateUserRole, assignToTeam, getTeamDataForAdmin } from "@/app/actions/admin";
import { createTeam } from "@/app/actions/teams";
import { LogOut, Shield, Users, Building2, Plus, UserPlus, Activity, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { TeamReadinessGraph } from "@/components/coach/TeamReadinessGraph";
import { AttendanceList } from "@/components/coach/AttendanceList";
import { organizations as orgSchema, teams as teamSchema, users as userSchema } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Organization = InferSelectModel<typeof orgSchema>;
type Team = InferSelectModel<typeof teamSchema>;
type User = InferSelectModel<typeof userSchema>;

export default async function AdminDashboard(props: {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const selectedTeamId = typeof searchParams.selectedTeamId === 'string' ? searchParams.selectedTeamId : undefined;

  let organizations: Organization[] = [];
  let teams: Team[] = [];
  let users: User[] = [];
  let selectedTeamData: any = null;

  try {
    const data = await getAdminData();
    organizations = data.organizations;
    teams = data.teams;
    users = data.users;

    if (selectedTeamId) {
      selectedTeamData = await getTeamDataForAdmin(selectedTeamId);
    }
  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw error;
  }

  async function handleCreateOrg(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    await createOrganization(name);
  }

  async function handleCreateTeam(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const orgId = formData.get("orgId") as string;
    await createTeam(name, orgId);
  }

  const avgMental = (selectedTeamData?.checkIns?.length ?? 0) > 0 
    ? (selectedTeamData.checkIns.reduce((acc: any, ci: any) => acc + ci.mentalRating, 0) / selectedTeamData.checkIns.length).toFixed(1) 
    : "N/A";
  const avgPhysical = (selectedTeamData?.checkIns?.length ?? 0) > 0 
    ? (selectedTeamData.checkIns.reduce((acc: any, ci: any) => acc + ci.physicalRating, 0) / selectedTeamData.checkIns.length).toFixed(1) 
    : "N/A";
  const avgPerformance = (selectedTeamData?.reviews?.length ?? 0) > 0 
    ? (selectedTeamData.reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / selectedTeamData.reviews.length).toFixed(1) 
    : "N/A";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Logo href="/admin" />
            <div className="hidden md:block h-8 w-px bg-border" />
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-foreground">Admin Control Center</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">System Administration</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-12">
        {/* Team Insights Section (New) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Activity className="w-6 h-6 text-primary" /> Team Insights & Analytics
            </h2>
            <form className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">View Team:</span>
              <AutoSubmitSelect 
                name="selectedTeamId" 
                defaultValue={selectedTeamId || ""} 
                className="p-2 border border-border rounded-lg bg-card text-foreground text-sm min-w-[200px]"
              >
                <option value="">Select a team to audit...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </AutoSubmitSelect>
            </form>
          </div>

          {selectedTeamData ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3 text-blue-500 mb-2">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Avg Mental Readiness</h3>
                  </div>
                  <p className="text-3xl font-black text-foreground">{avgMental}</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3 text-green-500 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Avg Physical Readiness</h3>
                  </div>
                  <p className="text-3xl font-black text-foreground">{avgPhysical}</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Star className="w-5 h-5 fill-yellow-500" />
                    <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Avg Performance</h3>
                  </div>
                  <p className="text-3xl font-black text-foreground">{avgPerformance}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <TeamReadinessGraph data={selectedTeamData.trends} />
                </div>
                <div className="lg:col-span-1">
                  <AttendanceList players={selectedTeamData.players} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Recent Player Check-Ins
                  </h3>
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                          <th className="p-4">Player</th>
                          <th className="p-4">Goal</th>
                          <th className="p-4 text-center">M/P/E</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedTeamData.checkIns.map((ci: any) => {
                          const player = selectedTeamData.players.find((p: any) => p.id === ci.playerId);
                          return (
                            <tr key={ci.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-bold text-foreground">{player?.name || "Unknown"}</td>
                              <td className="p-4 text-sm text-muted-foreground">{ci.goal}</td>
                              <td className="p-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[10px] font-bold">{ci.mentalRating}</span>
                                  <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold">{ci.physicalRating}</span>
                                  <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded text-[10px] font-bold">{ci.emotionalRating}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {selectedTeamData.checkIns.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground italic">No check-ins recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Recent Performance Reviews</h3>
                  <div className="space-y-4">
                    {selectedTeamData.reviews.map((r: any) => {
                      const player = selectedTeamData.players.find((p: any) => p.id === r.playerId);
                      return (
                        <div key={r.id} className="p-4 bg-card rounded-2xl border border-border shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-foreground">{player?.name || "Unknown"}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                              ))}
                            </div>
                          </div>
                          {r.notes && <p className="text-sm text-muted-foreground italic">&quot;{r.notes}&quot;</p>}
                        </div>
                      );
                    })}
                    {selectedTeamData.reviews.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border border-border shadow-sm italic">
                        No reviews recorded
                      </div>
                    )}
                  </div>
                </section>
              </div>
              <div className="h-px bg-border my-12" />
            </div>
          ) : (
            <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">Select a team above to view their check-in trends and player status.</p>
            </div>
          )}
        </section>

        {/* Organizations & Teams Management */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <Building2 className="w-6 h-6" /> Organizations
              </h2>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <form action={handleCreateOrg} className="flex gap-2 mb-6">
                <input 
                  name="name" 
                  placeholder="New Organization Name" 
                  required 
                  className="flex-1 p-2 border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Create
                </button>
              </form>
              <div className="space-y-2">
                {organizations.map(org => (
                  <div key={org.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center border border-border">
                    <span className="font-bold text-foreground">{org.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{org.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Users className="w-6 h-6" /> Teams
            </h2>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <form action={handleCreateTeam} className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <input 
                    name="name" 
                    placeholder="New Team Name" 
                    required 
                    className="flex-1 p-2 border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground"
                  />
                  <select name="orgId" required className="p-2 border border-border rounded-lg bg-muted text-foreground text-sm">
                    <option value="">Select Org...</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Create Team
                </button>
              </form>
              <div className="space-y-2">
                {teams.map(team => (
                  <div key={team.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center border border-border">
                    <div>
                      <span className="font-bold text-foreground">{team.name}</span>
                      <div className="flex gap-4 mt-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                          Coach: <span className="font-mono text-blue-500">{team.coachInviteCode}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                          Player: <span className="font-mono text-green-500">{team.playerInviteCode}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {organizations.find(o => o.id === team.orgId)?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Management */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <UserPlus className="w-6 h-6" /> User Management & Assignments
          </h2>
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="p-4">Name/Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Assigned Team</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 
                        user.role === 'coach' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {teams.find(t => t.id === user.teamId)?.name || "Unassigned"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <form action={async (fd) => {
                          "use server";
                          const role = fd.get("role") as "admin" | "coach" | "player";
                          await updateUserRole(user.id, role);
                        }}>
                          <AutoSubmitSelect name="role" defaultValue={user.role} className="text-xs p-1 border border-border rounded bg-muted text-foreground">
                            <option value="player">Make Player</option>
                            <option value="coach">Make Coach</option>
                            <option value="admin">Make Admin</option>
                          </AutoSubmitSelect>
                        </form>
                        <form action={async (fd) => {
                          "use server";
                          const teamId = fd.get("teamId") as string;
                          await assignToTeam(user.id, teamId === "none" ? null : teamId);
                        }}>
                          <AutoSubmitSelect name="teamId" defaultValue={user.teamId || "none"} className="text-xs p-1 border border-border rounded bg-muted text-foreground">
                            <option value="none">No Team</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </AutoSubmitSelect>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
