import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPlayerData } from "@/app/actions/coach";
import { ReadinessGraph } from "@/components/player/ReadinessGraph";
import { LogOut, ArrowLeft, Star, Calendar } from "lucide-react";
import Link from "next/link";

export default async function PlayerDetailedView({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") {
    redirect("/login");
  }

  const { id } = await params;
  const data = await getPlayerData(id);

  const { player, checkIns, reviews, trends } = data;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link 
            href="/coach/dashboard" 
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
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

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900">{player.name}</h1>
            <p className="text-zinc-500 font-medium">{player.email}</p>
          </div>
          <div className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
            Player Profile
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ReadinessGraph data={trends} />
            
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Recent Check-Ins
              </h2>
              <div className="space-y-3">
                {checkIns.map((ci) => (
                  <div key={ci.id} className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {new Date(ci.createdAt!).toLocaleDateString()}
                      </p>
                      <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">M:{ci.mentalRating}</span>
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold">P:{ci.physicalRating}</span>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">E:{ci.emotionalRating}</span>
                      </div>
                    </div>
                    <p className="font-bold text-zinc-800">&quot;{ci.goal}&quot;</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Star className="w-5 h-5" /> Recent Reviews
            </h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {new Date(r.createdAt!).toLocaleDateString()}
                    </p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} />
                      ))}
                    </div>
                  </div>
                  {r.notes ? (
                    <p className="text-zinc-600 italic">&quot;{r.notes}&quot;</p>
                  ) : (
                    <p className="text-zinc-400 text-xs italic">No notes provided</p>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-center py-8 text-zinc-400 text-sm italic bg-white rounded-2xl border border-dashed border-zinc-200">
                  No reviews recorded yet
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
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
