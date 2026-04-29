"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from "lucide-react";

export function CheckInForm() {
  const [goal, setGoal] = useState("");
  const [mental, setMental] = useState(5);
  const [physical, setPhysical] = useState(5);
  const [emotional, setEmotional] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for submission will go here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Check-in Complete!</h2>
        <p className="text-zinc-600">Great job setting your goal for today. Have a great practice!</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm text-zinc-500 hover:text-zinc-800 underline underline-offset-4"
        >
          Submit another (Debug)
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">Daily Check-In</h1>
        <p className="text-sm text-zinc-500">Set your intent and track your readiness for today.</p>
      </div>

      <div className="space-y-4">
        <label htmlFor="goal" className="block text-sm font-semibold text-zinc-900">
          What is your small, achievable goal for today?
        </label>
        <input
          id="goal"
          type="text"
          required
          placeholder="e.g., Focus on my footwork during drills"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400"
        />
      </div>

      <div className="space-y-10">
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
        className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-200"
      >
        Submit Check-In
      </button>
    </form>
  );
}
