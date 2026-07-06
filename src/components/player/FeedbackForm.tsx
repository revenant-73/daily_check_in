"use client";

import { useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await submitFeedback(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="w-20 h-20 bg-vibrant/20 rounded-3xl flex items-center justify-center text-vibrant">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight uppercase italic">Thank You!</h2>
          <p className="text-muted-foreground font-bold">Your feedback has been received and will help us improve the app.</p>
        </div>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] p-8 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
            Feedback Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['general', 'bug', 'ui', 'feature'].map((cat) => (
              <label key={cat} className="relative group cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  value={cat} 
                  defaultChecked={cat === 'general'} 
                  className="peer sr-only" 
                />
                <div className="p-3 text-center rounded-2xl border-2 border-border bg-muted/50 text-[10px] font-black uppercase tracking-widest transition-all peer-checked:border-vibrant peer-checked:bg-vibrant/10 peer-checked:text-vibrant group-hover:bg-muted">
                  {cat}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
            What's on your mind?
          </label>
          <textarea
            name="content"
            required
            rows={5}
            placeholder="Tell us about your experience, report a bug, or suggest a feature..."
            className="w-full p-6 rounded-3xl border-2 border-border bg-muted/50 text-foreground font-bold focus:bg-card focus:border-vibrant focus:outline-none transition-all placeholder:text-muted-foreground/50 italic"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
            Satisfaction Rating (1-10)
          </label>
          <div className="flex justify-between items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <label key={num} className="relative cursor-pointer flex-1">
                <input 
                  type="radio" 
                  name="rating" 
                  value={num} 
                  className="peer sr-only" 
                />
                <div className="aspect-square flex items-center justify-center rounded-xl border border-border bg-muted/30 text-xs font-black transition-all peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary">
                  {num}
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-vibrant text-vibrant-foreground rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 group"
        >
          {loading ? "Sending..." : "Submit Feedback"}
          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}
