import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPlayerEntries, getReadinessTrends } from "@/app/actions/entries";
import { CheckInForm } from "@/components/player/CheckInForm";
import { ReviewForm } from "@/components/player/ReviewForm";
import { ReadinessGraph } from "@/components/player/ReadinessGraph";
import { InstallPrompt } from "@/components/player/InstallPrompt";
import { db } from "@/lib/db";
import { users, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { History, Zap, TrendingUp, MessageSquare, ChevronRight, Target, Star } from "lucide-react";
import { getDailyMotivationalMessage } from "@/lib/utils/messages";
import { calculateStreak, getStreakMilestone } from "@/lib/utils/stats";
import { Header } from "@/components/layout/Header";

type CheckIn = {
  id: string;
  goal: string;
  mentalRating: number;
  physicalRating: number;
  emotionalRating: number;
  createdAt: Date | string | number | null;
  pillar?: string | null;
  metadata?: string | null;
};

type Review = {
  id: string;
  rating: number;
  notes: string | null;
  nextSessionNotes: string | null;
  createdAt: Date | string | number | null;
  metadata?: string | null;
};
import { PILLARS } from "@/lib/constants/pillars";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default async function PlayerDashboard(props: {
  searchParams: Promise<{ view?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "coach") {
    redirect("/coach/dashboard");
  }

  const dbUser = await db.select().from(users).where(eq(users.id, session.user.id)).get();
  
  if (!dbUser?.teamId) redirect("/onboarding");
  
  const team = await db.select().from(teams).where(eq(teams.id, dbUser.teamId)).get();

  let checkIns: CheckIn[] = [];
  let reviews: Review[] = [];
  let trends: { date: Date | null; mental: number; physical: number; emotional: number; average: number }[] = [];

  try {
    const entries = await getPlayerEntries();
    checkIns = entries.checkIns;
    reviews = entries.reviews;
    trends = await getReadinessTrends();
  } catch (error) {
    console.error("Error fetching player dashboard data:", error);
    throw error;
  }
  const view = searchParams.view || "home";
  const motivationalMessage = getDailyMotivationalMessage();
  const latestEntry = checkIns[0];
  const latestReview = reviews[0];
  const hasCheckedInToday = latestEntry && latestEntry.createdAt && new Date(latestEntry.createdAt).toDateString() === new Date().toDateString();
  const hasReviewedToday = latestReview && latestReview.createdAt && new Date(latestReview.createdAt).toDateString() === new Date().toDateString();
  const latestGoal = latestEntry?.goal;
  const latestMetadata = latestEntry?.metadata ? JSON.parse(latestEntry.metadata) : {};
  const latestPillar = latestEntry?.pillar || latestMetadata.pillar;

  const streak = calculateStreak(checkIns);
  const milestone = getStreakMilestone(streak);
  const edgeScore = latestEntry 
    ? Math.round(((latestEntry.mentalRating + latestEntry.physicalRating + latestEntry.emotionalRating) / 30) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <Header 
        userName={session.user.name} 
        role="Player" 
        teamName={team?.name} 
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-6">
        {view === "home" && (
          <div className="space-y-6">
            {!hasCheckedInToday && (
              <Link 
                href="/dashboard?view=check-in"
                className="block p-1 rounded-[2rem] bg-gradient-to-r from-primary via-vibrant to-primary animate-gradient-x shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
              >
                <div className="bg-background/90 backdrop-blur-xl rounded-[1.9rem] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Action Required</p>
                      <h3 className="text-lg font-black text-foreground tracking-tight">SET YOUR INTENT FOR TODAY</h3>
                      {latestReview?.nextSessionNotes && (
                        <p className="text-[10px] font-bold text-muted-foreground italic mt-1 flex items-center gap-1">
                          <Star className="w-2 h-2 text-vibrant fill-vibrant" />
                          Commitment: {latestReview.nextSessionNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground mr-2" />
                </div>
              </Link>
            )}

            {hasCheckedInToday && !hasReviewedToday && (
              <Link 
                href="/dashboard?view=review"
                className="block p-1 rounded-[2.5rem] bg-gradient-to-r from-vibrant via-primary to-vibrant animate-gradient-x shadow-xl shadow-vibrant/20 hover:scale-[1.01] transition-all group"
              >
                <div className="bg-background/90 backdrop-blur-xl rounded-[2.4rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-vibrant/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Star className="w-8 h-8 text-vibrant animate-pulse fill-vibrant/20" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant mb-1">Final Step</p>
                      <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic mb-1">REVIEW YOUR PRACTICE</h3>
                      <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Today&apos;s Mission: &quot;{latestGoal}&quot;
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Practice</span>
                      <span className="text-xs font-bold text-vibrant">Locked In</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-vibrant/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-6 h-6 text-vibrant" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground tracking-tighter">HELLO, {session.user.name?.split(' ')[0].toUpperCase() || 'ATHLETE'}!</h2>
                <p className="text-muted-foreground italic">&quot;{motivationalMessage}&quot;</p>
              </div>
              <div className="flex gap-3">
                 <div className="px-4 py-2 glass-card rounded-2xl flex items-center gap-2 border-vibrant/20">
                    <div className="w-2 h-2 rounded-full bg-vibrant animate-pulse shadow-[0_0_8px_var(--vibrant)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-vibrant">Live Season</span>
                 </div>
              </div>
            </div>
            
            <InstallPrompt />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hasCheckedInToday && hasReviewedToday && (
                <div className="md:col-span-3 glass-card rounded-[2.5rem] p-6 bg-vibrant/5 border-vibrant/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-vibrant/20 rounded-2xl flex items-center justify-center">
                      <Target className="w-8 h-8 text-vibrant" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-vibrant mb-0.5">Today&apos;s Mission</p>
                      <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">&quot;{latestGoal}&quot;</h3>
                    </div>
                  </div>
                  {latestPillar && (
                    <div className="px-6 py-3 rounded-2xl bg-background/50 border border-border flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-vibrant shadow-[0_0_8px_var(--vibrant)]" />
                      <span className="text-xs font-black uppercase tracking-widest text-foreground">{latestPillar}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Edge Score Card */}
              <div className="md:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Current Readiness</p>
                  <h3 className="text-5xl font-black text-foreground tracking-tighter mb-6">PERFORMANCE <span className="text-primary">EDGE</span></h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end gap-8">
                    <div className="flex items-end gap-4">
                      <div className="text-7xl font-black text-vibrant tabular-nums">{edgeScore}</div>
                      <div className="pb-2">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Score</div>
                        <div className="text-vibrant font-bold">Peak Potential</div>
                      </div>
                    </div>

                    {latestMetadata.coachNote && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 p-4 rounded-2xl bg-vibrant/5 border border-vibrant/20 relative"
                      >
                         <div className="absolute -top-2 -left-2 bg-vibrant text-vibrant-foreground p-1 rounded-lg">
                            <MessageSquare className="w-3 h-3 fill-current" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-vibrant mb-1">Coach Feedback</p>
                         <p className="text-sm font-bold text-foreground italic leading-tight">&quot;{latestMetadata.coachNote}&quot;</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
                  {[
                    { label: 'Mental', val: latestEntry?.mentalRating || 0, color: 'text-blue-400' },
                    { label: 'Physical', val: latestEntry?.physicalRating || 0, color: 'text-green-400' },
                    { label: 'Emotional', val: latestEntry?.emotionalRating || 0, color: 'text-purple-400' }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-1">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", stat.val <= 3 ? "bg-red-500" : stat.val <= 7 ? "bg-yellow-500" : "bg-vibrant")}
                          style={{ width: `${stat.val * 10}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Card */}
              <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-primary/5 border-primary/10">
                {milestone ? (
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2 animate-bounce">{milestone.icon}</div>
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-4", milestone.color)}>
                      {milestone.label} STATUS
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="text-5xl font-black text-foreground mb-1 tabular-nums">{streak}</div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Day Streak</p>
                <div className="mt-6 px-4 py-2 bg-vibrant/10 rounded-xl">
                  <p className="text-[10px] font-black text-vibrant uppercase tracking-widest">
                    {streak === 0 ? "Start your journey" : "Consistency is King"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ReadinessGraph data={trends} />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Recent History</h3>
                  <Link href="/dashboard?view=history" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                    <History className="w-3 h-3" />
                    View All
                  </Link>
                </div>
                <div className="glass-card rounded-[2.5rem] p-4 divide-y divide-border/50">
                  {checkIns.slice(0, 4).map((ci) => (
                    <div key={ci.id} className="p-4 flex justify-between items-center group hover:bg-muted/30 transition-colors rounded-2xl first:rounded-t-[2rem] last:rounded-b-[2rem]">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{ci.goal}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{ci.createdAt ? new Date(ci.createdAt).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div className="flex gap-1.5 ml-4">
                        <div className="w-2 h-2 rounded-full bg-blue-400/40" title={`Mental: ${ci.mentalRating}`}></div>
                        <div className="w-2 h-2 rounded-full bg-green-400/40" title={`Physical: ${ci.physicalRating}`}></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400/40" title={`Emotional: ${ci.emotionalRating}`}></div>
                      </div>
                    </div>
                  ))}
                  {checkIns.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No entries yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "check-in" && (
          <div className="max-w-lg mx-auto">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 gap-1">
              ← Back to Dashboard
            </Link>
            <CheckInForm 
              previousGoal={latestGoal} 
              latestReview={latestReview}
            />
          </div>
        )}

        {view === "review" && (
          <div className="max-w-lg mx-auto">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 gap-1">
              ← Back to Dashboard
            </Link>
            <ReviewForm goal={latestGoal} pillar={latestPillar} />
          </div>
        )}

        {view === "history" && (
          <div className="space-y-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-2 gap-1">
              ← Back to Dashboard
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">Check-Ins</h2>
                <div className="space-y-4">
                  {checkIns.map((ci) => (
                    <div key={ci.id} className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {ci.createdAt ? new Date(ci.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-4">{ci.goal}</h3>
                      {(() => {
                        const metadata = ci.metadata ? JSON.parse(ci.metadata) : {};
                        const displayPillar = ci.pillar || metadata.pillar;
                        if (!displayPillar) return null;
                        return (
                          <div className="mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                              Focus: {displayPillar}
                            </span>
                          </div>
                        );
                      })()}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">M: {ci.mentalRating}</div>
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">P: {ci.physicalRating}</div>
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">E: {ci.emotionalRating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                          ))}
                        </div>
                      </div>
                      {r.notes && <p className="text-muted-foreground italic">&quot;{r.notes}&quot;</p>}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {view === "resources" && (
          <div className="space-y-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-2 gap-1">
              ← Back to Dashboard
            </Link>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-foreground">Behavior Guide</h2>
              <p className="text-muted-foreground">These are the seven standards we focus on to help ourselves, our teammates, and our team get better.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PILLARS.map((p) => (
                <div key={p.name} className="p-6 bg-card rounded-2xl border border-border shadow-sm space-y-3">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-black">
                      {PILLARS.indexOf(p) + 1}
                    </span>
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Quick Action FAB */}
      {!hasReviewedToday && (
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <Link 
            href={hasCheckedInToday ? "/dashboard?view=review" : "/dashboard?view=check-in"}
            className={cn(
              "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform",
              hasCheckedInToday 
                ? "bg-vibrant text-vibrant-foreground shadow-vibrant/40" 
                : "bg-primary text-primary-foreground shadow-primary/40"
            )}
          >
            {hasCheckedInToday ? <Star className="w-8 h-8 fill-current" /> : <Zap className="w-8 h-8 fill-current" />}
          </Link>
        </div>
      )}
    </div>
  );
}
