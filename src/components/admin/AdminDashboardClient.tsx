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
  Activity
} from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { createOrganization, deleteOrganization, deleteUser, assignToTeam } from "@/app/actions/admin";

export default function AdminDashboardClient({ 
  initialData,
  userName
}: { 
  initialData: { 
    organizations: any[], 
    teams: any[], 
    users: any[] 
  },
  userName?: string | null
}) {
  const [search, setSearch] = useState("");
  const { organizations, teams, users } = initialData;

  const filteredTeams = useMemo(() => {
    return teams.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      if (!a.lastActivity) return -1;
      if (!b.lastActivity) return 1;
      return new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
    });
  }, [teams, search]);

  const unassignedUsers = users.filter(u => !u.teamId);

  const getHealthStatus = (lastActivity: string | null) => {
    if (!lastActivity) return { label: 'Inactive', color: 'text-red-500 bg-red-500/10' };
    const days = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 7) return { label: 'Stale', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'Active', color: 'text-vibrant bg-vibrant/10' };
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark pb-24 md:pb-8">
      <Header role="Admin" href="/admin" userName={userName || undefined} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-1">
              <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
                <Shield className="w-10 h-10 text-primary" /> Admin Lab
              </h2>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Global Systems Control</p>
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
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Team Health Audit
                 </h3>
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{filteredTeams.length} Total Teams</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filteredTeams.map(team => {
                    const health = getHealthStatus(team.lastActivity);
                    const org = organizations.find(o => o.id === team.orgId);
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
                            <div className="text-right">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Readiness</p>
                               <p className="text-lg font-black text-foreground">{((team.avgReadiness || 0) * 10).toFixed(0)}%</p>
                            </div>
                         </div>
                         <h4 className="text-xl font-black text-foreground group-hover:text-primary transition-colors truncate">{team.name}</h4>
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">{org?.name || 'No Org'}</p>
                         
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
                    <input name="name" required placeholder="New Org Name" className="flex-1 bg-muted/50 border border-border p-2 rounded-xl text-xs focus:outline-none" />
                    <button className="bg-primary text-primary-foreground p-2 rounded-xl"><Plus className="w-4 h-4" /></button>
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
                            <select name="teamId" required className="flex-1 bg-muted border border-border p-1.5 rounded-lg text-[10px] font-bold">
                               <option value="">Assign Team...</option>
                               {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button className="bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
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
