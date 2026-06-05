"use client";

import React, { useState, useTransition } from "react";
import { Upload, Check, AlertCircle, FileText } from "lucide-react";
import { batchCreateUsers } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

export function RosterUpload({ teamId }: { teamId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim()) return;

    // Simple parsing: "Name, Email" or "Name Email" per line
    const rows = data.split('\n').filter(row => row.trim().length > 0);
    const roster = rows.map(row => {
      const parts = row.includes(',') ? row.split(',') : row.split('\t');
      return {
        name: parts[0]?.trim() || "Unknown",
        email: parts[1]?.trim() || parts[0]?.trim()
      };
    }).filter(u => u.email.includes('@'));

    if (roster.length === 0) {
      alert("No valid email addresses found. Format: Name, Email");
      return;
    }

    startTransition(async () => {
      try {
        await batchCreateUsers(teamId, roster);
        setStatus('success');
        setData("");
        setTimeout(() => {
          setStatus('idle');
          setIsOpen(false);
        }, 2000);
      } catch (error) {
        setStatus('error');
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 group"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="text-center px-4">
          <p className="text-xs font-black uppercase tracking-widest text-foreground">Batch Upload Roster</p>
          <p className="text-[10px] text-muted-foreground">Paste from Excel or Google Sheets</p>
        </div>
      </button>

      {isOpen && (
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black uppercase tracking-[0.2em]">Paste Roster Data</h4>
            <div className="flex items-center gap-2">
               <FileText className="w-4 h-4 text-muted-foreground" />
               <span className="text-[10px] text-muted-foreground uppercase font-bold">Format: Name, Email</span>
            </div>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Ex:&#10;John Doe, john@example.com&#10;Jane Smith, jane@example.com"
              className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs focus:outline-none focus:border-primary min-h-[150px] font-mono"
            />
            <div className="flex gap-3">
               <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !data.trim()}
                className={cn(
                  "flex-[2] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                  status === 'success' ? "bg-vibrant text-vibrant-foreground" :
                  status === 'error' ? "bg-red-500 text-white" :
                  "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                )}
              >
                {isPending ? "Processing..." : 
                 status === 'success' ? <><Check className="w-4 h-4" /> Imported!</> :
                 status === 'error' ? <><AlertCircle className="w-4 h-4" /> Failed</> :
                 "Start Import"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
