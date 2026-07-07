"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, ChevronRight, ChevronLeft, Zap, Target, Brain, Shield, Star, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { submitCheckIn } from "@/app/actions/entries";
import { SMALL_ACHIEVABLE_GOALS } from "@/lib/constants/goals";
import { PILLARS } from "@/lib/constants/pillars";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "readiness", title: "Readiness", description: "How is your edge today?", icon: Zap },
  { id: "goal", title: "Daily Goal", description: "What is your focus?", icon: Target },
  { id: "standard", title: "Torchbearer Action", description: "How will you carry the culture today?", icon: Shield },
];

interface CheckInFormProps {
  previousGoal?: string;
  latestReview?: {
    nextSessionNotes: string | null;
    metadata?: string | null;
  } | null;
  isPreview?: boolean;
}

export function CheckInForm({ previousGoal, latestReview, isPreview }: CheckInFormProps) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [pillar, setPillar] = useState("");
  const [lookLike, setLookLike] = useState("");
  const [mental, setMental] = useState(5);
  const [physical, setPhysical] = useState(5);
  const [emotional, setEmotional] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitCheckIn({
        goal,
        pillar,
        metadata: { pillar, lookLike },
        mentalRating: mental,
        physicalRating: physical,
        emotionalRating: emotional,
      }, isPreview);
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
    <div className="w-full max-w-xl mx-auto pb-8 sm:pb-0">
      {/* Progress Header */}
      <div className="flex justify-between mb-6 px-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
              i === step ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
              i < step ? "bg-vibrant border-vibrant text-vibrant-foreground" : "bg-muted border-border text-muted-foreground"
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <span className={cn(
              "text-[8px] sm:text-[10px] font-black uppercase tracking-widest",
              i === step ? "text-foreground" : "text-muted-foreground"
            )}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-1 sm:space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                <CurrentIcon className="w-3 h-3" />
                Step {step + 1} of 3
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter uppercase">{STEPS[step].title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{STEPS[step].description}</p>
            </div>

            {step === 0 && (
              <div className="space-y-6 sm:space-y-10 py-2 sm:py-4">
                <Slider label="Mental Edge" value={mental} onChange={(e) => setMental(parseInt(e.target.value))} />
                <Slider label="Physical Power" value={physical} onChange={(e) => setPhysical(parseInt(e.target.value))} />
                <Slider label="Emotional Calm" value={emotional} onChange={(e) => setEmotional(parseInt(e.target.value))} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 sm:space-y-6">
                {latestReview?.nextSessionNotes && (
                  <div className="p-3 sm:p-4 rounded-2xl bg-vibrant/5 border border-vibrant/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-vibrant" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-vibrant mb-1 sm:mb-2">Last Commitment</p>
                    <p className="text-xs sm:text-sm font-bold text-foreground mb-2 sm:mb-3 italic">&quot;{latestReview.nextSessionNotes}&quot;</p>
                    
                    {(latestReview.nextSessionNotes.includes("Repeat") || latestReview.nextSessionNotes.includes("Adjust")) && previousGoal && (
                      <button 
                        type="button"
                        onClick={() => setGoal(previousGoal)}
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-vibrant/10 hover:bg-vibrant/20 text-vibrant px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Use Previous
                      </button>
                    )}
                  </div>
                )}
                
                {!latestReview?.nextSessionNotes && previousGoal && (
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary mb-1 sm:mb-2">Last Goal</p>
                    <button 
                      type="button"
                      onClick={() => setGoal(previousGoal)}
                      className="text-xs sm:text-sm font-bold text-foreground text-left hover:text-primary transition-colors italic"
                    >
                      &quot;{previousGoal}&quot;
                    </button>
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Suggested</p>
                    <select
                      value={SMALL_ACHIEVABLE_GOALS.includes(goal) ? goal : ""}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full p-4 sm:p-5 rounded-2xl bg-muted/50 border-2 border-border focus:border-primary transition-all text-xs sm:text-sm font-bold text-foreground appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select a suggestion...</option>
                      {SMALL_ACHIEVABLE_GOALS.map((suggestion) => (
                        <option key={suggestion} value={suggestion} className="bg-background text-foreground text-xs sm:text-sm">
                          {suggestion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                      <span className="bg-card px-4 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Custom</p>
                    <input
                      type="text"
                      placeholder="Your custom goal..."
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-muted/50 border-2 border-border focus:border-primary transition-all text-sm sm:text-xl font-bold placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {PILLARS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setPillar(p.name)}
                      className={cn(
                        "p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 text-left transition-all relative group",
                        pillar === p.name 
                          ? "bg-primary border-primary shadow-lg" 
                          : "bg-muted/30 border-border hover:border-muted-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <span className={cn(
                          "font-black uppercase tracking-widest text-[10px] sm:text-xs",
                          pillar === p.name ? "text-primary-foreground" : "text-foreground"
                        )}>{p.name}</span>
                        {pillar === p.name && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />}
                      </div>
                      <p className={cn(
                        "text-[10px] sm:text-xs leading-relaxed",
                        pillar === p.name ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>{p.description}</p>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {pillar && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 sm:space-y-3 pt-4 border-t border-border"
                    >
                      <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Implementation Action</p>
                      <textarea
                        autoFocus
                        placeholder="Explain your action..."
                        value={lookLike}
                        onChange={(e) => setLookLike(e.target.value)}
                        className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-muted/50 border-2 border-border focus:border-primary transition-all text-sm sm:text-lg font-bold placeholder:text-muted-foreground/50 min-h-[100px] sm:min-h-[120px]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 sm:gap-4 mt-8 sm:mt-12">
          {step > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 border-border font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-muted transition-colors flex items-center justify-center gap-1 sm:gap-2"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={loading || (step === 1 && !goal) || (step === 2 && (!pillar || !lookLike))}
            className={cn(
              "flex-[2] py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all shadow-xl shadow-primary/20",
              loading || (step === 1 && !goal) || (step === 2 && (!pillar || !lookLike))
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {loading ? "Syncing..." : step === STEPS.length - 1 ? "Lock it in" : "Next"}
            {!loading && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
