"use client";

import React, { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, ChevronRight, ChevronLeft, Zap, Target, Brain, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { submitCheckIn } from "@/app/actions/entries";
import { SMALL_ACHIEVABLE_GOALS } from "@/lib/constants/goals";
import { PILLARS } from "@/lib/constants/pillars";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "readiness", title: "Readiness", description: "How is your edge today?", icon: Zap },
  { id: "goal", title: "Daily Goal", description: "What is your focus?", icon: Target },
  { id: "standard", title: "Standard", description: "Which pillar will you own?", icon: Shield },
];

interface CheckInFormProps {
  previousGoal?: string;
}

export function CheckInForm({ previousGoal }: CheckInFormProps) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [pillar, setPillar] = useState("");
  const [mental, setMental] = useState(5);
  const [physical, setPhysical] = useState(5);
  const [emotional, setEmotional] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Randomize some goals for the "Chips"
  const goalSuggestions = useMemo(() => {
    return [...SMALL_ACHIEVABLE_GOALS].sort(() => 0.5 - Math.random()).slice(0, 8);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitCheckIn({
        goal,
        pillar,
        metadata: { pillar },
        mentalRating: mental,
        physicalRating: physical,
        emotionalRating: emotional,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit check-in");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 glass-card rounded-[2.5rem] text-center"
      >
        <div className="w-24 h-24 bg-vibrant/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-vibrant" />
        </div>
        <h2 className="text-3xl font-black text-foreground mb-4 tracking-tighter">LOCKED IN.</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xs">Your intent is set. Go dominate your practice.</p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Header */}
      <div className="flex justify-between mb-8 px-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
              i === step ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
              i < step ? "bg-vibrant border-vibrant text-vibrant-foreground" : "bg-muted border-border text-muted-foreground"
            )}>
              {i < step ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              i === step ? "text-foreground" : "text-muted-foreground"
            )}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                <CurrentIcon className="w-3 h-3" />
                Step {step + 1} of 3
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">{STEPS[step].title}</h1>
              <p className="text-muted-foreground font-medium">{STEPS[step].description}</p>
            </div>

            {step === 0 && (
              <div className="space-y-10 py-4">
                <Slider label="Mental Edge" value={mental} onChange={(e) => setMental(parseInt(e.target.value))} />
                <Slider label="Physical Power" value={physical} onChange={(e) => setPhysical(parseInt(e.target.value))} />
                <Slider label="Emotional Calm" value={emotional} onChange={(e) => setEmotional(parseInt(e.target.value))} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                {previousGoal && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Last Session's Goal</p>
                    <button 
                      type="button"
                      onClick={() => setGoal(previousGoal)}
                      className="text-sm font-bold text-foreground text-left hover:text-primary transition-colors italic"
                    >
                      "{previousGoal}"
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                   <input
                    autoFocus
                    type="text"
                    placeholder="Enter your custom goal..."
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full p-6 rounded-3xl bg-muted/50 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xl font-bold placeholder:text-muted-foreground/50"
                  />
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Quick Picks</p>
                  <div className="flex flex-wrap gap-2">
                    {goalSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setGoal(suggestion)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                          goal === suggestion 
                            ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                            : "bg-muted/30 border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-3">
                {PILLARS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPillar(p.name)}
                    className={cn(
                      "p-5 rounded-3xl border-2 text-left transition-all relative group",
                      pillar === p.name 
                        ? "bg-primary border-primary shadow-lg" 
                        : "bg-muted/30 border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-black uppercase tracking-widest text-xs",
                        pillar === p.name ? "text-primary-foreground" : "text-foreground"
                      )}>{p.name}</span>
                      {pillar === p.name && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <p className={cn(
                      "text-xs leading-relaxed",
                      pillar === p.name ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>{p.description}</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 mt-12">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 py-5 rounded-2xl border-2 border-border font-black uppercase tracking-widest text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={loading || (step === 1 && !goal) || (step === 2 && !pillar)}
            className={cn(
              "flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20",
              loading || (step === 1 && !goal) || (step === 2 && !pillar)
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {loading ? "Syncing..." : step === STEPS.length - 1 ? "Lock it in" : "Next Step"}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
