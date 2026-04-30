"use client";

import React, { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { submitReview } from "@/app/actions/entries";

export function ReviewForm() {
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReview({ rating, notes });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border shadow-sm text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Complete!</h2>
        <p className="text-muted-foreground">Thanks for reflecting on your practice. Rest up!</p>
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
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Post-Practice Review</h1>
        <p className="text-base text-muted-foreground">How did today&apos;s session go?</p>
      </div>

      <div className="space-y-4">
        <label className="block text-base font-bold text-foreground">
          Rate your practice performance
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= rating ? "fill-yellow-400 text-yellow-400" : "text-border"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label htmlFor="notes" className="block text-base font-bold text-foreground">
          Any notes or reflections? (Optional)
        </label>
        <textarea
          id="notes"
          rows={4}
          placeholder="What went well? What could be better?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-5 rounded-2xl border-2 border-border bg-muted focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground text-foreground text-lg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-xl hover:opacity-90 active:scale-[0.97] transition-all shadow-xl shadow-primary/20 mt-4 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
