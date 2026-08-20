"use client";

import React, { useState, useTransition } from "react";
import { Upload, Check, AlertCircle, FileText, ClipboardCheck, RotateCcw } from "lucide-react";
import { batchCreateUsers, previewRosterImport } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

type RosterRow = {
  line: number;
  name: string;
  email: string;
};

type RejectedRosterRow = {
  line: number;
  raw: string;
  reason: string;
};

type ExistingRosterUser = Awaited<ReturnType<typeof previewRosterImport>>["existingUsers"][number];

type RosterPreview = {
  targetTeamName: string;
  validRows: RosterRow[];
  malformedRows: RejectedRosterRow[];
  duplicateRows: RejectedRosterRow[];
  existingUsers: ExistingRosterUser[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRosterData(data: string) {
  const seenEmails = new Set<string>();
  const validRows: RosterRow[] = [];
  const malformedRows: RejectedRosterRow[] = [];
  const duplicateRows: RejectedRosterRow[] = [];

  data.split("\n").forEach((rawRow, index) => {
    const raw = rawRow.trim();
    if (!raw) return;

    const line = index + 1;
    const parts = raw.includes(",")
      ? raw.split(",")
      : raw.includes("\t")
        ? raw.split("\t")
        : raw.split(/\s+/);

    const emailIndex = parts.findIndex(part => part.trim().includes("@"));
    const email = emailIndex >= 0 ? parts[emailIndex].trim().toLowerCase() : "";
    const nameParts = raw.includes(",") || raw.includes("\t")
      ? [parts[0]]
      : parts.filter((_, partIndex) => partIndex !== emailIndex);
    const name = nameParts.join(" ").trim() || "Unknown";

    if (!emailPattern.test(email)) {
      malformedRows.push({ line, raw, reason: "Missing or invalid email" });
      return;
    }

    if (seenEmails.has(email)) {
      duplicateRows.push({ line, raw, reason: "Duplicate email in pasted roster" });
      return;
    }

    seenEmails.add(email);
    validRows.push({ line, name, email });
  });

  return { validRows, malformedRows, duplicateRows };
}

export function RosterUpload({ teamId }: { teamId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [preview, setPreview] = useState<RosterPreview | null>(null);
  const [error, setError] = useState("");

  const resetPreview = () => {
    setPreview(null);
    setStatus("idle");
    setError("");
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim()) return;

    const parsed = parseRosterData(data);

    if (parsed.validRows.length === 0) {
      setPreview({
        targetTeamName: "",
        existingUsers: [],
        ...parsed,
      });
      setError("No valid email addresses found.");
      return;
    }

    startTransition(async () => {
      try {
        setError("");
        const serverPreview = await previewRosterImport(teamId, parsed.validRows);
        setPreview({
          ...parsed,
          targetTeamName: serverPreview.targetTeamName,
          existingUsers: serverPreview.existingUsers,
        });
      } catch (error) {
        setStatus('error');
        setError("Failed to preview roster. Please try again.");
        console.error(error);
      }
    });
  };

  const handleConfirmImport = () => {
    if (!preview || preview.validRows.length === 0) return;

    startTransition(async () => {
      try {
        await batchCreateUsers(teamId, preview.validRows.map(row => ({
          name: row.name,
          email: row.email,
        })));
        setStatus('success');
        setData("");
        setPreview(null);
        setTimeout(() => {
          setStatus('idle');
          setIsOpen(false);
        }, 2000);
      } catch (error) {
        setStatus('error');
        setError("Import failed. Please review the roster and try again.");
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
          <form onSubmit={handlePreview} className="space-y-4">
            <textarea
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                resetPreview();
              }}
              placeholder="Ex:&#10;John Doe, john@example.com&#10;Jane Smith, jane@example.com"
              className="w-full bg-muted/50 border border-border p-4 rounded-2xl text-xs focus:outline-none focus:border-primary min-h-[150px] font-mono"
            />
            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-500">
                {error}
              </p>
            )}

            {preview && (
              <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-foreground">Import Preview</p>
                    <p className="text-[10px] font-bold text-muted-foreground">
                      {preview.targetTeamName ? `Target team: ${preview.targetTeamName}` : "Fix invalid rows before importing."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-xl font-black text-foreground">{preview.validRows.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Ready</p>
                  </div>
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-xl font-black text-foreground">{preview.existingUsers.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Existing</p>
                  </div>
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-xl font-black text-foreground">{preview.duplicateRows.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Duplicate</p>
                  </div>
                  <div className="rounded-xl bg-background/50 p-3">
                    <p className="text-xl font-black text-foreground">{preview.malformedRows.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Invalid</p>
                  </div>
                </div>

                {preview.existingUsers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Existing Accounts</p>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                      {preview.existingUsers.map(user => (
                        <div key={user.id} className="rounded-xl bg-background/50 p-3 text-xs">
                          <p className="font-bold text-foreground">{user.name || user.email}</p>
                          <p className="text-muted-foreground">{user.email}</p>
                          <p className="mt-1 text-[10px] font-bold text-primary">
                            {user.willMoveTeams
                              ? `Will move from ${user.teamName || "unassigned"}`
                              : "Already on this team"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(preview.duplicateRows.length > 0 || preview.malformedRows.length > 0) && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skipped Rows</p>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                      {[...preview.duplicateRows, ...preview.malformedRows].map(row => (
                        <div key={`${row.line}-${row.raw}`} className="rounded-xl bg-red-500/10 p-3 text-xs text-red-500">
                          <p className="font-black">Line {row.line}: {row.reason}</p>
                          <p className="font-mono text-[10px] opacity-80">{row.raw}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
               <button
                type="button"
                onClick={() => {
                  resetPreview();
                  setIsOpen(false);
                }}
                className="flex-1 py-3 rounded-xl border border-border font-bold text-xs hover:bg-muted"
              >
                Cancel
              </button>
              {preview ? (
                <>
                  <button
                    type="button"
                    onClick={resetPreview}
                    className="py-3 px-4 rounded-xl border border-border font-bold text-xs hover:bg-muted flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isPending || preview.validRows.length === 0}
                    className={cn(
                      "flex-[2] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                      status === 'success' ? "bg-vibrant text-vibrant-foreground" :
                      status === 'error' ? "bg-red-500 text-white" :
                      "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    )}
                  >
                    {isPending ? "Importing..." :
                     status === 'success' ? <><Check className="w-4 h-4" /> Imported!</> :
                     status === 'error' ? <><AlertCircle className="w-4 h-4" /> Failed</> :
                     `Confirm Import (${preview.validRows.length})`}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={isPending || !data.trim()}
                  className={cn(
                    "flex-[2] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                    status === 'error' ? "bg-red-500 text-white" :
                    "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  )}
                >
                  {isPending ? "Checking..." :
                   status === 'error' ? <><AlertCircle className="w-4 h-4" /> Failed</> :
                   "Preview Import"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
