import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getAdminData, deleteTeam } from "@/app/actions/admin";
import { LogOut, Building2, Users, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function OrganizationView(props: { params: Promise<{ orgId: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  let organization: any = null;
  let teams: any[] = [];

  try {
    const data = await getAdminData();
    organization = data.organizations.find((o: any) => o.id === params.orgId);
    if (!organization) notFound();
    
    teams = data.teams.filter((t: any) => t.organizationId === params.orgId);
  } catch (error) {
    console.error("Error fetching org data:", error);
    throw error;
  }

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
              <span className="text-foreground">{organization.name}</span>
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
          <Link href="/admin" className="inline-flex items-center text-sm font-bold text-primary hover:underline gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" /> {organization.name}
          </h2>
          <p className="text-muted-foreground">Manage teams and view performance for this organization.</p>
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
              <Link href="/admin" className="text-primary font-bold hover:underline mt-2 inline-block">Create a team</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
