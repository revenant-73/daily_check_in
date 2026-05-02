import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminData, createOrganization, deleteOrganization, deleteTeam, deleteUser, updateUserRole, assignToTeam } from "@/app/actions/admin";
import { createTeam } from "@/app/actions/teams";
import { LogOut, Shield, Users, Building2, Plus, UserPlus, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminDashboard() {
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
    throw error;
  }

  const unassignedUsers = users.filter(u => !u.teamId);

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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Organizations Management */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <Building2 className="w-6 h-6 text-primary" /> Organizations
              </h2>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-6">
              <form action={handleCreateOrg} className="flex gap-2">
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
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {organizations.map(org => (
                  <Link 
                    key={org.id} 
                    href={`/admin/org/${org.id}`}
                    className="p-4 bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl flex justify-between items-center border border-border group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{org.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{teams.filter(t => t.organizationId === org.id).length} Teams</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DeleteButton 
                        id={org.id} 
                        onDelete={deleteOrganization} 
                        confirmMessage={`Are you sure? This deletes ALL teams and data in "${org.name}".`}
                      />
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Team Creation */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Plus className="w-6 h-6 text-primary" /> Quick Team Create
            </h2>
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <form action={handleCreateTeam} className="space-y-4">
                <input 
                  name="name" 
                  placeholder="New Team Name" 
                  required 
                  className="w-full p-2 border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground"
                />
                <select name="orgId" required className="w-full p-2 border border-border rounded-lg bg-muted text-foreground text-sm">
                  <option value="">Select Organization...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Create Team
                </button>
              </form>
            </div>

            {/* Unassigned Users */}
            <div className="pt-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground mb-4">
                <UserPlus className="w-5 h-5 text-primary" /> Unassigned Users ({unassignedUsers.length})
              </h2>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                  {unassignedUsers.map(user => (
                    <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-sm text-foreground">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email} • {user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          className="p-1.5 border border-border rounded bg-muted text-xs text-foreground"
                          onChange={async (e) => {
                            "use server";
                            // This would need a client component for direct interactivity, 
                            // but we'll keep it simple for now or use a form.
                          }}
                          defaultValue={user.teamId || ""}
                        >
                          <option value="">Assign to team...</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <DeleteButton id={user.id} onDelete={deleteUser} />
                      </div>
                    </div>
                  ))}
                  {unassignedUsers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      All users are assigned to teams.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
