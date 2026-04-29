import React from "react";
import { 
  CheckCircle2, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Zap, 
  ClipboardList, 
  TrendingUp, 
  HeartPulse,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function PromoPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-100 py-4 px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight uppercase">Daily Check-In</span>
          </div>
          <Link 
            href="/login" 
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-full hover:scale-105 transition-all active:scale-95"
          >
            Start Your Season
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-black uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5 fill-zinc-900 text-zinc-900" />
            Performance Readiness Platform
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            KNOW YOUR TEAM <br />
            <span className="text-zinc-400">BEFORE THE WHISTLE BLOWS.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            The elite toolkit for modern coaches to track athlete readiness, set daily intents, and build a culture of high performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-zinc-200 transition-all flex items-center justify-center gap-2 group"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-5">
           <div className="absolute top-0 left-0 w-64 h-64 bg-zinc-900 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-900 rounded-full blur-3xl"></div>
        </div>
      </header>

      {/* Stats/Social Proof */}
      <section className="py-12 border-y border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Check-In Speed", value: "< 30 Sec" },
            { label: "Readiness Metrics", value: "Mental & Physical" },
            { label: "Season Tracking", value: "Unlimited" },
            { label: "Player Privacy", value: "Encrypted" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Coaches Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Actionable Data <br />
              <span className="text-zinc-400">For Every Practice.</span>
            </h2>
            <div className="space-y-6">
              {[
                { 
                  icon: <BarChart3 className="w-6 h-6" />, 
                  title: "Readiness Insights", 
                  desc: "Instantly see team-wide mental and physical readiness averages to adjust practice intensity on the fly." 
                },
                { 
                  icon: <ClipboardList className="w-6 h-6" />, 
                  title: "Daily Intent Setting", 
                  desc: "Require players to set one achievable goal before they step on the field, driving focus and accountability." 
                },
                { 
                  icon: <HeartPulse className="w-6 h-6" />, 
                  title: "Identify Red Flags", 
                  desc: "Monitor trends to spot players struggling with burnout, stress, or recovery before it impacts performance." 
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-900">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                    <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-[2.5rem] aspect-square lg:aspect-video flex items-center justify-center overflow-hidden shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black p-8 flex flex-col justify-end">
               <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 w-32 bg-white/20 rounded-full"></div>
                    <div className="h-6 w-12 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-white/40"></div>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-white/40"></div>
                    </div>
                  </div>
               </div>
            </div>
            <p className="text-white/30 font-black uppercase tracking-[1em] text-xs rotate-90 absolute right-0">Dashboard Preview</p>
          </div>
        </div>
      </section>

      {/* For Directors Section */}
      <section className="py-24 px-6 bg-zinc-900 text-white rounded-[3rem] mx-4 mb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="grid grid-cols-2 gap-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="bg-white/5 border border-white/10 aspect-square rounded-3xl flex items-center justify-center">
                    <Users className="w-8 h-8 opacity-20" />
                 </div>
               ))}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-zinc-900 p-8 rounded-full shadow-2xl font-black text-2xl">
              100%
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Standardize <br />
              <span className="text-zinc-500">Athlete Care.</span>
            </h2>
            <p className="text-lg text-zinc-400 font-medium">
              Give your athletic department the tools to monitor program health. Identify which teams are thriving and which need more resources.
            </p>
            <ul className="space-y-4">
              {[
                "Department-wide compliance tracking",
                "Longitudinal performance analytics",
                "Simplified coach-to-athlete communication",
                "Centralized team and roster management"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">The Modern Standard</h2>
          <p className="text-zinc-500 font-medium">Everything you need, nothing you don&apos;t.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Mobile First",
              desc: "Designed to be used on the sidelines and in the locker room. Fast, thumb-friendly inputs.",
              icon: <Zap className="w-6 h-6" />
            },
            {
              title: "Performance Trends",
              desc: "See how athlete readiness fluctuates across the season with automated trend reporting.",
              icon: <TrendingUp className="w-6 h-6" />
            },
            {
              title: "Athlete Reviews",
              desc: "Capture post-practice reflections to close the loop on daily growth and development.",
              icon: <CheckCircle2 className="w-6 h-6" />
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center bg-zinc-50">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            READY TO <br />
            <span className="text-zinc-300">DOMINATE?</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/login" 
              className="px-12 py-6 bg-zinc-900 text-white rounded-[2rem] font-black text-xl hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-zinc-200"
            >
              Get Started for Free
            </Link>
            <Link 
              href="mailto:demo@example.com" 
              className="px-12 py-6 border-2 border-zinc-900 text-zinc-900 rounded-[2rem] font-black text-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm tracking-tight uppercase">Daily Check-In</span>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
            Built for elite programs • {new Date().getFullYear()}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
