import Link from "next/link";
import { ArrowRight, Zap, Target, LineChart, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 dark">
      <main className="max-w-4xl w-full bg-card p-8 sm:p-16 rounded-[2.5rem] shadow-2xl shadow-primary/10 border-2 border-primary/5 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-black mb-8 uppercase tracking-[0.2em]">
            <Zap className="w-4 h-4 fill-primary" />
            Athlete Ready
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-foreground mb-6 tracking-tighter leading-[0.9]">
            DOMINATE <br />
            <span className="text-primary">YOUR DAY.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-tight font-medium">
            The ultimate daily toolkit for athletes to lock in, track progress, and own every single practice.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground">Set Intent</h3>
              <p className="text-xs text-muted-foreground">Pick your focus and crush your small goals.</p>
            </div>
            
            <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground">Track Readiness</h3>
              <p className="text-xs text-muted-foreground">Monitor your physical and mental edge.</p>
            </div>

            <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground">Own the Season</h3>
              <p className="text-xs text-muted-foreground">Become the best version of you.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login" 
              className="group px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 w-full sm:w-auto"
            >
              LEVEL UP NOW
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-muted-foreground text-sm font-black uppercase tracking-widest opacity-50 flex items-center gap-4">
        <span>Performance First</span>
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>Built for Athletes</span>
      </footer>
    </div>
  );
}
