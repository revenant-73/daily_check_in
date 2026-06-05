import Link from "next/link";
import { ArrowRight, Zap, Target, LineChart, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 dark selection:bg-vibrant selection:text-vibrant-foreground">
      <main className="max-w-5xl w-full glass-card p-8 sm:p-20 rounded-[3rem] text-center relative overflow-hidden border-primary/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-vibrant/10 rounded-full blur-[100px] -ml-48 -mb-48 animate-pulse" />

        <div className="relative z-10 space-y-12">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-vibrant/10 text-vibrant text-[10px] font-black uppercase tracking-[0.3em] border border-vibrant/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <Zap className="w-4 h-4 fill-vibrant animate-bounce" />
            Athlete Ready v2.0
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl sm:text-9xl font-black text-foreground tracking-tighter leading-[0.8] uppercase italic">
              PRACTICE <br />
              <span className="text-vibrant drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">WITH PURPOSE.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-tight font-medium uppercase tracking-tight">
              Notice where you are, set your intent, and reflect on what you learned.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Set Intent', desc: 'Pick your focus and crush your small goals.', color: 'text-primary' },
              { icon: LineChart, title: 'Track Edge', desc: 'Monitor your physical and mental readiness.', color: 'text-vibrant' },
              { icon: Trophy, title: 'Own the Season', desc: 'Become the ultimate version of yourself.', color: 'text-accent' }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-muted/20 rounded-[2rem] border border-border/50 text-center space-y-4 hover:bg-muted/40 transition-colors group">
                <div className={cn("w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg", feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-black text-foreground uppercase tracking-widest text-sm">{feature.title}</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <Link 
              href="/login" 
              className="group px-12 py-6 bg-primary text-primary-foreground rounded-2xl font-black text-2xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(99,102,241,0.2)] flex items-center gap-4 w-full sm:w-auto mx-auto uppercase tracking-tighter italic"
            >
              Enter the Lab
              <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="mt-20 py-10 w-full flex flex-col items-center gap-8">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-vibrant/30 to-transparent" />
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.3em]">
          <span>Small goals</span>
          <div className="w-1 h-1 rounded-full bg-vibrant/20" />
          <span>Better practice</span>
          <div className="w-1 h-1 rounded-full bg-vibrant/20" />
          <span>Stronger teams</span>
        </div>
      </footer>
    </div>
  );
}

import { cn } from "@/lib/utils";
