"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from "lucide-react";

import { submitCheckIn } from "@/app/actions/entries";

export function CheckInForm() {
  const [goal, setGoal] = useState("");
  const [mental, setMental] = useState(5);
  const [physical, setPhysical] = useState(5);
  const [emotional, setEmotional] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitCheckIn({
        goal,
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border shadow-sm text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Check-in Complete!</h2>
        <p className="text-muted-foreground">Great job setting your goal for today. Have a great practice!</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Submit another (Debug)
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 sm:p-10 rounded-2xl border border-border shadow-sm max-w-lg mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Daily Check-In</h1>
        <p className="text-base text-muted-foreground">Set your intent for today&apos;s practice.</p>
      </div>

      <div className="space-y-4 pt-2">
        <label htmlFor="goal" className="block text-base font-bold text-foreground">
          What is your small, achievable goal?
        </label>
        <input
          id="goal"
          type="text"
          required
          placeholder="e.g., Focus on my footwork"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full p-5 rounded-2xl border-2 border-border bg-muted focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground text-foreground text-lg"
        />
      </div>

      <div className="space-y-12 py-4">
        <Slider 
          label="Mental Readiness" 
          value={mental} 
          onChange={(e) => setMental(parseInt(e.target.value))} 
        />
        <Slider 
          label="Physical Readiness" 
          value={physical} 
          onChange={(e) => setPhysical(parseInt(e.target.value))} 
        />
        <Slider 
          label="Emotional Readiness" 
          value={emotional} 
          onChange={(e) => setEmotional(parseInt(e.target.value))} 
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-xl hover:opacity-90 active:scale-[0.97] transition-all shadow-xl shadow-primary/20 mt-4 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Check-In"}
      </button>
    </form>
  );
}
