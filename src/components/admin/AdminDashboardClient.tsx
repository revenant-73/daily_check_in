"use client";

import React, { useState, useMemo } from "react";
import { 
  Shield, 
  Users, 
  Building2, 
  Plus, 
  UserPlus, 
  ChevronRight, 
  UserCheck,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CopyInviteButton } from "@/components/admin/CopyInviteButton";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { createOrganization, deleteOrganization, deleteUser, assignToTeam, deleteTeam } from "@/app/actions/admin";
import { organizations as organizationsSchema, teams as teamsSchema, users as usersSchema } from "@/lib/db/schema";

type TeamWithStats = typeof teamsSchema.$inferSelect & {
  avgReadiness: number;
  avgPerformance: number;
  playerCount: number;
  lastActivity: Date | string | null;
};

type TeamFilter = "attention" | "recent" | "noToday" | "all";

function getActivityDate(lastActivity: Date | string | null) {
  return lastActivity ? new Date(lastActivity) : null;
}

function isSameCalendarDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function getDaysSince(lastActivity: Date | string | null) {
  const activityDate = getActivityDate(lastActivity);
  if (!activityDate) return null;

  return Math.floor((Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getHealthStatus(team: TeamWithStats) {
  const activityDate = getActivityDate(team.lastActivity);
  const days = getDaysSince(team.lastActivity);
  const checkedInToday = activityDate ? isSameCalendarDay(activityDate, new Date()) : false;

  if (!activityDate) {
    return {
      label: "Inactive",
      reason: "No activity yet",
      color: "text-red-500 bg-red-500/10 border-red-500/20",
      checkedInToday,
      days,
    };
  }

  if (checkedInToday) {
    return {
      label: "Active Today",
      reason: "Player activity today",
      color: "text-vibrant bg-vibrant/10 border-vibrant/20",
      checkedInToday,
      days,
    };
  }

  if (days !== null && days > 7) {
    return {
      label: "Stale",
      reason: `${days} days since activity`,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      checkedInToday,
      days,
    };
  }

  return {
    label: "No Check-Ins Today",
    reason: days === 0 ? "No player activity today" : `${days} days since activity`,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    checkedInToday,
    days,
  };
}

export default function AdminDashboardClient({ 
  initialData,
  userName
}: { 
  initialData: { 
    organizations: (typeof organizationsSchema.$inferSelect)[], 
    teams: TeamWithStats[],
    users: (typeof usersSchema.$inferSelect)[] 
  },
  userName?: string | null
}) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("attention");
  const { organizations, teams, users } = initialData;

  const teamCards = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.map((team) => {
      const organization = organizations.find(o => o.id === team.orgId);
      const health = getHealthStatus(team);
      const lowReadiness = team.avgReadiness > 0 && team.avgReadiness <= 4;
      const needsAttention = !health.checkedInToday || lowReadiness;
      const recentlyActive = health.days !== null && health.days <= 7;

      return {
        team,
        organization,
        health,
        lowReadiness,
        needsAttention,
        recentlyActive,
      };
    }).filter(({ team, organization }) => {
      if (!query) return true;

      return [team.name, organization?.name || ""].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [organizations, teams, search]);

  const filteredTeams = useMemo(() => {
    return teamCards.filter((card) => {
      if (teamFilter === "attention") return card.needsAttention;
      if (teamFilter === "recent") return card.recentlyActive;
      if (teamFilter === "noToday") return !card.health.checkedInToday;
      return true;
    }).sort((a, b) => {
      if (teamFilter === "recent") {
        return (getActivityDate(b.team.lastActivity)?.getTime() || 0) - (getActivityDate(a.team.lastActivity)?.getTime() || 0);
      }

      const scoreA = (a.lowReadiness ? 3 : 0) + (!a.team.lastActivity ? 2 : 0) + (!a.health.checkedInToday ? 1 : 0);
      const scoreB = (b.lowReadiness ? 3 : 0) + (!b.team.lastActivity ? 2 : 0) + (!b.health.checkedInToday ? 1 : 0);
      if (scoreA !== scoreB) return scoreB - scoreA;

      return (getActivityDate(a.team.lastActivity)?.getTime() || 0) - (getActivityDate(b.team.lastActivity)?.getTime() || 0);
    });
  }, [teamCards, teamFilter]);

  const filterOptions: { id: TeamFilter; label: string; description: string; count: number; icon: typeof Activity }[] = [
    {
      id: "attention",
      label: "Needs attention",
      description: "Stale, inactive, or low readiness",
      count: teamCards.filter(card => card.needsAttention).length,
      icon: AlertTriangle,
    },
    {
      id: "recent",
      label: "Recently active",
      description: "Activity in the last 7 days",
      count: teamCards.filter(card => card.recentlyActive).length,
      icon: CheckCircle2,
    },
    {
      id: "noToday",
      label: "No check-ins today",
      description: "No player activity today",
      count: teamCards.filter(card => !card.health.checkedInToday).length,
      icon: Clock,
    },
    {
      id: "all",
      label: "All teams",
      description: "Every matching team",
      count: teamCards.length,
      icon: Users,
    },
  ];

  const unassignedUsers = users.filter(u => !u.teamId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark pb-28 md:pb-8">
      <Header role="Admin" href="/admin" userName={userName || undefined} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-1">
              <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
                <Shield className="w-10 h-10 text-primary" /> Admin Lab
              </h2>
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Global Systems Control</p>
                <Link 
                  href="/dashboard?preview=true" 
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  <Users className="w-3 h-3" />
                  Demo Player Experience
                </Link>
              </div>
           </div>
           
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams or organizations..."
                className="w-full bg-card border border-border p-4 pl-12 rounded-2xl focus:outline-none focus:border-primary transition-all text-sm"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Team Health Audit
                    </h3>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      Showing {filteredTeams.length} of {teamCards.length} matching teams. Sorted by action priority.
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{teams.length} Total Teams</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTeamFilter(option.id)}
                      className={cn(
                        "min-h-20 rounded-2xl border p-3 text-left transition-all",
                        teamFilter === option.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <option.icon className={cn("w-4 h-4", teamFilter === option.id && "text-primary")} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                        </div>
                        <span className="rounded-full bg-background/60 px-2 py-0.5 text-xs font-black tabular-nums">
                          {option.count}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] font-bold leading-tight opacity-70">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filteredTeams.map(({ team, organization, health, lowReadiness }) => {
                    return (
                      <Link 
                        key={team.id}
                        href={`/admin/team/${team.id}`}
                        className="glass-card p-6 rounded-3xl hover:border-primary/30 transition-all group relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="w-16 h-16" />
                         </div>
                         <div className="flex justify-between items-start mb-4">
                            <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border", health.color)}>
                               {health.label}
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="text-right">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Readiness</p>
                                  <p className="text-lg font-black text-foreground">{((team.avgReadiness || 0) * 10).toFixed(0)}%</p>
                               </div>
                               <DeleteButton 
                                 id={team.id} 
                                 onDelete={deleteTeam} 
                                 size="sm" 
                                 className="opacity-0 group-hover:opacity-100 transition-opacity"
                               />
                            </div>
                         </div>
                         <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors truncate">{team.name}</h4>
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{organization?.name || 'No Org'}</p>
                         <div className="mb-4 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-muted/50 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                              {health.reason}
                            </span>
                            {lowReadiness && (
                              <span className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                                Low readiness
                              </span>
                            )}
                         </div>
                         
                         <div className="mb-4">
                            <CopyInviteButton code={team.playerInviteCode || ""} className="w-full justify-center py-2" />
                         </div>

                         <div className="flex justify-between items-center pt-4 border-t border-border/50">
                            <div className="flex gap-4">
                               <div className="text-center">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase">Players</p>
                                  <p className="text-xs font-black">{team.playerCount}</p>
                               </div>
                               <div className="text-center">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase">Last Activity</p>
                                  <p className="text-xs font-black">{team.lastActivity ? new Date(team.lastActivity).toLocaleDateString() : 'Never'}</p>
                               </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                         </div>
                      </Link>
                    );
                 })}
                 {filteredTeams.length === 0 && (
                    <div className="md:col-span-2 rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
                      <p className="text-sm font-black uppercase tracking-widest text-foreground">No teams match this view</p>
                      <p className="mt-2 text-xs font-bold text-muted-foreground">Try another triage filter or clear the search.</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="space-y-8">
              <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Organizations
                 </h3>
                 <form action={async (formData) => {
                    const name = formData.get("name") as string;
                    await createOrganization(name);
                 }} className="flex gap-2">
                    <input name="name" required placeholder="New Org Name" className="min-h-11 flex-1 bg-muted/50 border border-border px-3 py-2 rounded-xl text-xs focus:outline-none" />
                    <button className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label="Create organization" title="Create organization"><Plus className="w-4 h-4" /></button>
                 </form>
                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {organizations.map(org => (
                      <div key={org.id} className="p-3 bg-muted/30 rounded-2xl border border-border/50 flex justify-between items-center group">
                         <Link href={`/admin/org/${org.id}`} className="font-bold text-xs hover:text-primary transition-colors">{org.name}</Link>
                         <DeleteButton id={org.id} onDelete={deleteOrganization} size="sm" />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
                 <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" /> Unassigned ({unassignedUsers.length})
                 </h3>
                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {unassignedUsers.map(user => (
                      <div key={user.id} className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-3">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-xs font-black uppercase tracking-tight">{user.name || 'Anonymous'}</p>
                               <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                            </div>
                            <DeleteButton id={user.id} onDelete={deleteUser} size="sm" />
                         </div>
                         <form action={async (formData) => {
                            const teamId = formData.get("teamId") as string;
                            if (teamId) await assignToTeam(user.id, teamId);
                         }} className="flex gap-2">
                            <select name="teamId" required className="min-h-11 flex-1 bg-muted border border-border px-3 py-2 rounded-lg text-xs font-bold">
                               <option value="">Assign Team...</option>
                               {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors" aria-label={`Assign ${user.name || user.email} to selected team`} title="Assign to selected team">
                               <UserCheck className="w-4 h-4" />
                            </button>
                         </form>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
