"use client";

import React, { useState } from "react";
import { EmojiRating } from "@/components/ui/EmojiRating";
import { DictationButton } from "@/components/ui/DictationButton";
import { CheckCircle2, Star, ChevronRight, ChevronLeft, Zap, Target, Shield, MessageSquare, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReview } from "@/app/actions/entries";
import { cn, hapticFeedback } from "@/lib/utils";

const STEPS = [
  { id: "readiness", title: "Readiness", description: "How are you leaving practice?", icon: Zap },
  { id: "goal", title: "Goal Review", description: "Did you practice what you said?", icon: Target },
  { id: "torchbearer", title: "Culture Review", description: "How did you carry the culture?", icon: Shield },
  { id: "reflection", title: "One Reflection", description: "What do you want to remember?", icon: MessageSquare },
  { id: "next", title: "Next Rep", description: "What is your next commitment?", icon: RotateCcw },
];

interface ReviewFormProps {
  goal?: string;
  pillar?: string;
  isPreview?: boolean;
}

export function ReviewForm({ goal, pillar, isPreview }: ReviewFormProps) {
  const [step, setStep] = useState(0);
  const [mental, setMental] = useState(6);
  const [physical, setPhysical] = useState(6);
  const [emotional, setEmotional] = useState(6);
  const [goalAttention, setGoalAttention] = useState<string | null>(null);
  const [cultureReview, setCultureReview] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [nextCommitment, setNextCommitment] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    hapticFeedback("medium");
    setLoading(true);
    try {
      await submitReview({
        rating: goalAttention === "Yes" ? 5 : goalAttention === "Somewhat" ? 3 : 1,
        mentalRating: mental,
        physicalRating: physical,
        emotionalRating: emotional,
        notes: reflection,
        nextSessionNotes: nextCommitment || "",
        metadata: {
          goalAttention,
          cultureReview,
          originalGoal: goal,
          originalPillar: pillar,
          nextCommitment
        }
      }, isPreview);
      hapticFeedback("success");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    hapticFeedback("light");
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    hapticFeedback("light");
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
        <h2 className="text-3xl font-black text-foreground mb-4 tracking-tighter">PRACTICE SEALED.</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xs">Reflection complete. Rest, recover, and get ready for the next rep.</p>
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
      <div className="flex justify-between mb-6 px-2 overflow-x-auto no-scrollbar gap-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
              i === step ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
              i < step ? "bg-vibrant border-vibrant text-vibrant-foreground" : "bg-muted border-border text-muted-foreground"
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibrant/10 text-vibrant text-[9px] font-black uppercase tracking-widest">
                <CurrentIcon className="w-3 h-3" />
                Step {step + 1} of 5
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter uppercase">{STEPS[step].title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{STEPS[step].description}</p>
            </div>

            {step === 0 && (
              <div className="space-y-6 sm:space-y-10 py-2 sm:py-4">
                <EmojiRating 
                  label="Mental Edge" 
                  description="Focus and cognitive clarity. How sharp was your mind during the session?"
                  value={mental} 
                  onChange={(val) => setMental(val)} 
                />
                <EmojiRating 
                  label="Physical Power" 
                  description="Energy and body state. How much did you have left in the tank?"
                  value={physical} 
                  onChange={(val) => setPhysical(val)} 
                />
                <EmojiRating 
                  label="Emotional Calm" 
                  description="Composure and mood. How well did you handle the session's pressure?"
                  value={emotional} 
                  onChange={(val) => setEmotional(val)} 
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-primary/5 border-2 border-primary/20">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary mb-1 sm:mb-2">Today&apos;s Goal</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground italic uppercase">&quot;{goal || "No goal set"}&quot;</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest text-center">Honest attention today?</p>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {["Yes", "Somewhat", "No"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          hapticFeedback("medium");
                          setGoalAttention(option);
                          setTimeout(nextStep, 200);
                        }}
                        className={cn(
                          "py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest transition-all border-2 text-xs sm:text-sm",
                          goalAttention === option 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "bg-muted/50 border-border hover:border-primary/50 text-foreground"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-vibrant/5 border-2 border-vibrant/20">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-vibrant mb-1 sm:mb-2">Torchbearer Action</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground italic uppercase">&quot;{pillar || "No action"}&quot;</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest text-center">Cultural Impact?</p>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {[
                      { id: "lived", label: "Lived it clearly" },
                      { id: "progress", label: "Made progress" },
                      { id: "missed", label: "Missed chances" },
                      { id: "avoided", label: "Avoided it" }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          hapticFeedback("medium");
                          setCultureReview(option.label);
                          setTimeout(nextStep, 200);
                        }}
                        className={cn(
                          "py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest transition-all border-2 text-left flex justify-between items-center text-xs sm:text-sm",
                          cultureReview === option.label 
                            ? "bg-vibrant border-vibrant text-vibrant-foreground" 
                            : "bg-muted/50 border-border hover:border-vibrant/50 text-foreground"
                        )}
                      >
                        {option.label}
                        {cultureReview === option.label && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest">One moment to remember?</p>
                    <DictationButton onResult={(text) => setReflection(prev => prev ? `${prev} ${text}` : text)} />
                  </div>
                  <textarea
                    autoFocus
                    placeholder="Technical, emotional, social..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-muted/50 border-2 border-border focus:border-primary transition-all text-sm sm:text-lg font-bold placeholder:text-muted-foreground/50 min-h-[120px] sm:min-h-[160px]"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <p className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest text-center">Next commitment?</p>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {[
                    "Repeat today's goal",
                    "Adjust today's goal",
                    "Choose a new goal"
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        hapticFeedback("medium");
                        setNextCommitment(option);
                        setTimeout(nextStep, 200);
                      }}
                      className={cn(
                        "py-4 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest transition-all border-2 text-left text-xs sm:text-sm",
                        nextCommitment === option 
                          ? "bg-primary border-primary text-primary-foreground shadow-lg" 
                          : "bg-muted/50 border-border hover:border-primary/50 text-foreground"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
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
            disabled={
              loading || 
              (step === 1 && !goalAttention) || 
              (step === 2 && !cultureReview) || 
              (step === 3 && !reflection) || 
              (step === 4 && !nextCommitment)
            }
            className={cn(
              "flex-[2] py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all shadow-xl shadow-primary/20",
              loading || 
              (step === 1 && !goalAttention) || 
              (step === 2 && !cultureReview) || 
              (step === 3 && !reflection) || 
              (step === 4 && !nextCommitment)
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {loading ? "Syncing..." : step === STEPS.length - 1 ? "Complete" : "Next"}
            {!loading && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          &quot;Did I practice what I said I would practice?&quot;
        </p>
      </div>
    </div>
  );
}
