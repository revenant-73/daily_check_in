import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminData, createOrganization, updateUserRole, assignToTeam } from "@/app/actions/admin";
import { createTeam } from "@/app/actions/teams";
import { LogOut, Shield, Users, Building2, Plus, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const { organizations: orgs, teams: allTeams, users: allUsers } = await getAdminData();

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
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-zinc-900">Admin Control Center</h1>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-zinc-600">{session.user.name}</span>
            <Link href="/api/auth/signout" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
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
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6" /> Organizations
              </h2>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <form action={handleCreateOrg} className="flex gap-2 mb-6">
                <input 
                  name="name" 
                  placeholder="New Organization Name" 
                  required 
                  className="flex-1 p-2 border rounded-lg bg-zinc-50"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Create
                </button>
              </form>
              <div className="space-y-2">
                {orgs.map(org => (
                  <div key={org.id} className="p-3 bg-zinc-50 rounded-lg flex justify-between items-center border border-zinc-100">
                    <span className="font-bold">{org.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{org.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" /> Teams
            </h2>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <form action={handleCreateTeam} className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <input 
                    name="name" 
                    placeholder="New Team Name" 
                    required 
                    className="flex-1 p-2 border rounded-lg bg-zinc-50"
                  />
                  <select name="orgId" required className="p-2 border rounded-lg bg-zinc-50 text-sm">
                    <option value="">Select Org...</option>
                    {orgs.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Create Team
                </button>
              </form>
              <div className="space-y-2">
                {allTeams.map(team => (
                  <div key={team.id} className="p-3 bg-zinc-50 rounded-lg flex justify-between items-center border border-zinc-100">
                    <div>
                      <span className="font-bold">{team.name}</span>
                      <p className="text-[10px] text-zinc-400">Code: <span className="font-mono font-bold text-primary">{team.inviteCode}</span></p>
                    </div>
                    <span className="text-xs text-zinc-400">
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6" /> User Management & Assignments
          </h2>
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                  <th className="p-4">Name/Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Assigned Team</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-zinc-900">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                        user.role === 'coach' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-600">
                      {allTeams.find(t => t.id === user.teamId)?.name || "Unassigned"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <form action={async (fd) => {
                          "use server";
                          const role = fd.get("role") as "admin" | "coach" | "player";
                          await updateUserRole(user.id, role);
                        }}>
                          <select name="role" defaultValue={user.role} className="text-xs p-1 border rounded" onChange={(e) => e.target.form?.requestSubmit()}>
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
                          <select name="teamId" defaultValue={user.teamId || "none"} className="text-xs p-1 border rounded" onChange={(e) => e.target.form?.requestSubmit()}>
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
