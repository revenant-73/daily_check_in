"use client";

import { useState } from "react";
import { joinTeamByCode } from "@/app/actions/teams";
import { useRouter } from "next/navigation";
import { Hash, ArrowRight } from "lucide-react";

export function JoinByCodeForm({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await joinTeamByCode(code);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-3xl border border-border shadow-xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Hash className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Have an Invite Code?</h2>
        <p className="text-sm text-muted-foreground font-medium">Enter the 6-character code from your coach.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EX: A1B2C3"
            maxLength={6}
            required
            className="w-full p-4 text-center text-2xl font-black tracking-[0.5em] rounded-2xl border-2 border-border bg-muted text-foreground focus:bg-card focus:border-primary focus:outline-none transition-all uppercase placeholder:text-muted-foreground/30"
          />
        </div>
        
        {error && (
          <p className="text-xs text-red-500 font-bold text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? "Joining..." : "Join Team"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
