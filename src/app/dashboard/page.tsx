import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPlayerEntries, getReadinessTrends } from "@/app/actions/entries";
import { CheckInForm } from "@/components/player/CheckInForm";
import { ReviewForm } from "@/components/player/ReviewForm";
import { ReadinessGraph } from "@/components/player/ReadinessGraph";
import { db } from "@/lib/db";
import { users, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ClipboardList, History, LogOut, CheckCircle2 } from "lucide-react";

export default async function PlayerDashboard({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "coach") {
    redirect("/coach/dashboard");
  }

  // Alternative fetch if relations are not set up in schema
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  
  if (!dbUser?.teamId) redirect("/onboarding");
  
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, dbUser.teamId),
  });

  const { checkIns, reviews } = await getPlayerEntries();
  const trends = await getReadinessTrends();
  const view = (await searchParams).view || "home";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">{team?.name}</p>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-zinc-600 hidden sm:inline">{session.user.name}</span>
            <Link 
              href="/api/auth/signout"
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8">
        {view === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zinc-900">Today&apos;s Practice</h2>
              <div className="grid gap-4">
                <Link 
                  href="/dashboard?view=check-in"
                  className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Pre-Practice Check-In</h3>
                    <p className="text-sm text-zinc-500">Set your goal and readiness level</p>
                  </div>
                </Link>
                <Link 
                  href="/dashboard?view=review"
                  className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-white text-zinc-900 border-2 border-zinc-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Post-Practice Review</h3>
                    <p className="text-sm text-zinc-500">Reflect on your performance</p>
                  </div>
                </Link>
              </div>

              <ReadinessGraph data={trends} />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zinc-900">History</h2>
                <Link href="/dashboard?view=history" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
                  <History className="w-4 h-4" />
                  View All
                </Link>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm divide-y divide-zinc-100">
                {checkIns.slice(0, 5).map((ci) => (
                  <div key={ci.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-zinc-800">{ci.goal}</p>
                      <p className="text-xs text-zinc-400">{new Date(ci.createdAt!).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400" title={`Mental: ${ci.mentalRating}`}></div>
                      <div className="w-2 h-2 rounded-full bg-green-400" title={`Physical: ${ci.physicalRating}`}></div>
                      <div className="w-2 h-2 rounded-full bg-purple-400" title={`Emotional: ${ci.emotionalRating}`}></div>
                    </div>
                  </div>
                ))}
                {checkIns.length === 0 && (
                  <div className="p-8 text-center text-zinc-400">
                    No entries yet. Start your first check-in!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "check-in" && (
          <div className="max-w-lg mx-auto">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 mb-6 gap-1">
              ← Back to Dashboard
            </Link>
            <CheckInForm />
          </div>
        )}

        {view === "review" && (
          <div className="max-w-lg mx-auto">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 mb-6 gap-1">
              ← Back to Dashboard
            </Link>
            <ReviewForm />
          </div>
        )}

        {view === "history" && (
          <div className="space-y-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 mb-2 gap-1">
              ← Back to Dashboard
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-bold mb-4">Check-Ins</h2>
                <div className="space-y-4">
                  {checkIns.map((ci) => (
                    <div key={ci.id} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {new Date(ci.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <h3 className="font-bold text-zinc-900 text-lg mb-4">{ci.goal}</h3>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">M: {ci.mentalRating}</div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">P: {ci.physicalRating}</div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">E: {ci.emotionalRating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {new Date(r.createdAt!).toLocaleDateString()}
                        </p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} />
                          ))}
                        </div>
                      </div>
                      {r.notes && <p className="text-zinc-600 italic">&quot;{r.notes}&quot;</p>}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
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
