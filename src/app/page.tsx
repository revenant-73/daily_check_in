import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <main className="max-w-3xl bg-card p-8 sm:p-12 rounded-3xl shadow-xl shadow-primary/5 border border-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Live Performance Tracking
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground mb-4 tracking-tight">
          Daily Check-In
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          The professional toolkit for athletes to set daily goals, track readiness, and dominate their season.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-left">
          <div className="p-6 border border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-foreground text-lg mb-1">For Athletes</h2>
            <p className="text-sm text-muted-foreground">Submit quick daily goals and track your mental and physical readiness.</p>
          </div>
          <div className="p-6 border border-border rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-bold text-foreground text-lg mb-1">For Coaches</h2>
            <p className="text-sm text-muted-foreground">Monitor team trends and identify individual support needs in real-time.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/DOCS.md" 
            className="group px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/CHECKLIST.md" 
            className="px-8 py-4 border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-all flex items-center justify-center"
          >
            View Roadmap
          </Link>
        </div>
      </main>
      <footer className="mt-12 text-muted-foreground text-sm font-medium">
        Built with <span className="text-foreground">Next.js</span> + <span className="text-foreground">Tailwind 4</span> + <span className="text-foreground">Drizzle</span>
      </footer>
    </div>
  );
}
