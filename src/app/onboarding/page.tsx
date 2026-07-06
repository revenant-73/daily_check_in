import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createTeam, joinTeam } from "@/app/actions/teams";
import { db } from "@/lib/db";
import { users, organizations, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JoinByCodeForm } from "@/components/player/JoinByCodeForm";
import { LogOut, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default async function OnboardingPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialCode = searchParams.code;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await db.select().from(users).where(eq(users.id, session.user.id)).get();

  if (dbUser?.teamId) {
    redirect("/dashboard");
  }

  const orgs = await db.select().from(organizations);
  const allTeams = await db.select().from(teams);

  const orgsWithTeams = orgs.map(org => ({
    ...org,
    teams: allTeams.filter(t => t.orgId === org.id)
  }));

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    // Default to the first organization or create a default one
    const org = await db.select().from(organizations).limit(1).get();
    let orgId = org?.id;
    if (!orgId) {
      const result = await db.insert(organizations).values({ name: "Default Org" }).returning();
      orgId = result[0].id;
    }
    await createTeam(name, orgId);
    redirect("/dashboard");
  }

  async function handleJoin(teamId: string) {
    "use server";
    await joinTeam(teamId);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 space-y-12 dark">
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center">
        <Logo />
        <Link 
          href="/api/auth/signout"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <JoinByCodeForm initialCode={initialCode} />
          
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Create a New Team</h3>
              <p className="text-xs text-muted-foreground">For coaches or independent groups.</p>
            </div>
            <form action={handleCreate} className="space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Team Name (e.g. Varsity Soccer)"
                className="w-full p-4 rounded-2xl border-2 border-border bg-muted text-foreground focus:bg-card focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="w-full py-4 border-2 border-primary text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            </form>
          </div>
        </div>

        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6 h-full flex flex-col">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Select Your Team</h3>
            <p className="text-xs text-muted-foreground">Find your team in the list below.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {orgsWithTeams.map((org) => (
              <div key={org.id} className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                  {org.name}
                </h4>
                <div className="grid gap-2">
                  {org.teams.map((team) => (
                    <form key={team.id} action={handleJoin.bind(null, team.id)}>
                      <button
                        type="submit"
                        className="w-full p-4 bg-muted/50 hover:bg-muted rounded-2xl text-left border border-border transition-colors group flex justify-between items-center"
                      >
                        <span className="font-bold text-foreground">{team.name}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black">Join</span>
                      </button>
                    </form>
                  ))}
                  {org.teams.length === 0 && (
                    <p className="text-xs text-muted-foreground italic px-2">No teams yet.</p>
                  )}
                </div>
              </div>
            ))}
            {orgsWithTeams.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <p className="text-sm text-muted-foreground">No organizations found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
