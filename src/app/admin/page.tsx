import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminData, createOrganization, updateUserRole, assignToTeam } from "@/app/actions/admin";
import { createTeam } from "@/app/actions/teams";
import { LogOut, Shield, Users, Building2, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

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

  let organizations: any[] = [];
  let teams: any[] = [];
  let users: any[] = [];

  try {
    const data = await getAdminData();
    organizations = data.organizations;
    teams = data.teams;
    users = data.users;
  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw error; // Re-throw to be caught by error.tsx but now we have a log
  }

  const orgs = organizations;
  const allTeams = teams;
  const allUsers = users;

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
                {orgs.map(org => (
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
                    {orgs.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Create Team
                </button>
              </form>
              <div className="space-y-2">
                {allTeams.map(team => (
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
                      {orgs.find(o => o.id === team.orgId)?.name}
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
                {allUsers.map(user => (
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
                      {allTeams.find(t => t.id === user.teamId)?.name || "Unassigned"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <form action={async (fd) => {
                          "use server";
                          const role = fd.get("role") as "admin" | "coach" | "player";
                          await updateUserRole(user.id, role);
                        }}>
                          <select name="role" defaultValue={user.role} className="text-xs p-1 border border-border rounded bg-muted text-foreground" onChange={(e) => e.target.form?.requestSubmit()}>
                            <option value="player">Make Player</option>
                            <option value="coach">Make Coach</option>
                            <option value="admin">Make Admin</option>
                          </select>
                        </form>
                        <form action={async (fd) => {
                          "use server";
                          const teamId = fd.get("teamId") as string;
                          await assignToTeam(user.id, teamId === "none" ? null : teamId);
                        }}>
                          <select name="teamId" defaultValue={user.teamId || "none"} className="text-xs p-1 border border-border rounded bg-muted text-foreground" onChange={(e) => e.target.form?.requestSubmit()}>
                            <option value="none">No Team</option>
                            {allTeams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
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
