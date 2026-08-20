import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getAdminData, deleteTeam, adminCreateTeam } from "@/app/actions/admin";
import { organizations as organizationsSchema, teams as teamsSchema } from "@/lib/db/schema";
import { Building2, Users, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Header } from "@/components/layout/Header";

export default async function OrganizationView(props: { params: Promise<{ orgId: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  let organization: Awaited<ReturnType<typeof getAdminData>>["organizations"][0] | null = null;
  let teams: Awaited<ReturnType<typeof getAdminData>>["teams"] = [];

  try {
    const data = await getAdminData();
    organization = data.organizations.find((o) => o.id === params.orgId) || null;
    if (!organization) notFound();
    
    teams = data.teams.filter((t) => t.orgId === params.orgId);
  } catch (error) {
    console.error("Error fetching org data:", error);
    throw error;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <Header 
        userName={session.user.name} 
        role="Admin" 
        href="/admin"
      />
      <div className="bg-card border-b border-border py-2 px-4 sticky top-[73px] z-10 md:hidden">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/admin" className="text-muted-foreground">Admin</Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-primary">{organization.name}</span>
        </nav>
      </div>
      <div className="hidden md:block bg-card border-b border-border py-1 px-4 sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-primary">{organization.name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 pb-28 md:pb-8">
        <div className="space-y-2">
          <Link href="/admin" className="inline-flex items-center text-sm font-bold text-primary hover:underline gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" /> {organization.name}
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-muted-foreground">Manage teams and view performance for this organization.</p>
            
            <form action={async (formData) => {
              "use server";
              const name = formData.get("name") as string;
              if (name) await adminCreateTeam(name, params.orgId);
            }} className="flex gap-2 w-full md:w-auto">
              <input 
                name="name" 
                required 
                placeholder="New Team Name" 
                className="flex-1 md:w-64 bg-card border border-border p-2 rounded-xl text-xs focus:outline-none focus:border-primary transition-all" 
              />
              <button className="bg-primary text-primary-foreground p-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-bold text-xs px-4">
                <Plus className="w-4 h-4" />
                Add Team
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Link 
              key={team.id} 
              href={`/admin/team/${team.id}`}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <DeleteButton 
                    id={team.id} 
                    onDelete={deleteTeam} 
                    confirmMessage={`Delete "${team.name}"? This cannot be undone.`}
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{team.name}</h3>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-4">{team.playerCount || 0} Players</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Readiness</p>
                    <p className="text-lg font-black text-foreground">{team.avgReadiness?.toFixed(1) || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Performance</p>
                    <p className="text-lg font-black text-foreground">{team.avgPerformance?.toFixed(1) || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end text-sm font-bold text-primary group-hover:gap-2 transition-all">
                View Analytics <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
          {teams.length === 0 && (
            <div className="col-span-full bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No teams in this organization yet.</p>
              <p className="text-xs text-muted-foreground mt-2">Use the form above to create your first team.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
