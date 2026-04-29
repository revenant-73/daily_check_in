import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createTeam } from "@/app/actions/teams";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JoinByCodeForm } from "@/components/player/JoinByCodeForm";
import { LogOut, Plus } from "lucide-react";
import Link from "next/link";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (user?.teamId) {
    redirect("/dashboard");
  }

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    let org = await db.query.organizations.findFirst();
    if (!org) {
      const result = await db.insert(organizations).values({ name: "Default Org" }).returning();
      org = result[0];
    }
    await createTeam(name, org.id);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 space-y-12">
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-end">
        <Link 
          href="/api/auth/signout"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </header>

      <JoinByCodeForm />

      <div className="w-full max-w-md text-center">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-zinc-200 flex-1"></div>
          <span className="text-zinc-400 font-black text-[10px] uppercase tracking-widest">Or Start Fresh</span>
          <div className="h-px bg-zinc-200 flex-1"></div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-zinc-900">Create a New Team</h3>
            <p className="text-xs text-zinc-500">For coaches or independent groups.</p>
          </div>
          <form action={handleCreate} className="space-y-4">
            <input
              name="name"
              type="text"
              required
              placeholder="Team Name (e.g. Varsity Soccer)"
              className="w-full p-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-zinc-900 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="w-full py-4 border-2 border-zinc-900 text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-900 hover:text-white transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
