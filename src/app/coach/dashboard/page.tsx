import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamData, getTeamReadinessTrends } from "@/app/actions/coach";
import { TeamReadinessGraph } from "@/components/coach/TeamReadinessGraph";
import { AttendanceList } from "@/components/coach/AttendanceList";
import { LogOut, Users, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function CoachDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/login");
  }

  const data = await getTeamData();
  const trends = await getTeamReadinessTrends();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Team Assigned</h1>
          <p className="text-zinc-500 mt-2">Please ask an admin to assign you to a team.</p>
          <Link href="/api/auth/signout" className="mt-4 inline-block text-primary font-bold">Sign Out</Link>
        </div>
      </div>
    );
  }

  const { team, players, checkIns, reviews } = data;

  // Simple stats
  const avgMental = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ci.mentalRating, 0) / checkIns.length).toFixed(1) : "N/A";
  const avgPhysical = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ci.physicalRating, 0) / checkIns.length).toFixed(1) : "N/A";
  const avgPerformance = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "N/A";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Coach Dashboard</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">{team?.name}</p>
              <span className="text-[10px] text-zinc-300 font-bold">•</span>
              <p className="text-xs font-bold text-zinc-900">Invite Code: <span className="font-mono text-primary select-all">{team?.inviteCode}</span></p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-zinc-600 hidden sm:inline">Coach {session.user.name}</span>
            <Link 
              href="/api/auth/signout"
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <Activity className="w-5 h-5" />
              <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Avg Mental Readiness</h3>
            </div>
            <p className="text-3xl font-black text-zinc-900">{avgMental}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 text-green-500 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Avg Physical Readiness</h3>
            </div>
            <p className="text-3xl font-black text-zinc-900">{avgPhysical}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 text-yellow-500 mb-2">
              <Users className="w-5 h-5" />
              <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider">Avg Performance</h3>
            </div>
            <p className="text-3xl font-black text-zinc-900">{avgPerformance}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TeamReadinessGraph data={trends} />
          </div>
          <div className="lg:col-span-1">
            <AttendanceList players={players} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Recent Player Check-Ins</h2>
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                    <th className="p-4">Player</th>
                    <th className="p-4">Goal</th>
                    <th className="p-4">Readiness (M/P/E)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {checkIns.map((ci) => {
                    const player = players.find(p => p.id === ci.playerId);
                    return (
                      <tr key={ci.id} className="hover:bg-zinc-50 transition-colors group">
                        <td className="p-4">
                          <Link href={`/coach/player/${ci.playerId}`} className="font-bold text-zinc-900 hover:text-primary transition-colors">
                            {player?.name || "Unknown"}
                          </Link>
                        </td>
                        <td className="p-4 text-zinc-600">{ci.goal}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                             <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">{ci.mentalRating}</span>
                             <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold">{ci.physicalRating}</span>
                             <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold">{ci.emotionalRating}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {checkIns.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-zinc-400">No check-ins today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Recent Performance Reviews</h2>
             <div className="space-y-4">
               {reviews.map((r) => {
                 const player = players.find(p => p.id === r.playerId);
                 return (
                   <div key={r.id} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                       <Link href={`/coach/player/${r.playerId}`} className="font-bold text-zinc-900 hover:text-primary transition-colors">
                        {player?.name || "Unknown"}
                       </Link>
                       <div className="flex gap-0.5">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} />
                         ))}
                       </div>
                     </div>
                     {r.notes && <p className="text-sm text-zinc-500 italic">&quot;{r.notes}&quot;</p>}
                     <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold tracking-widest">
                       {new Date(r.createdAt!).toLocaleDateString()}
                     </p>
                   </div>
                 );
               })}
                {reviews.length === 0 && (
                  <div className="p-8 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                    No reviews yet
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
