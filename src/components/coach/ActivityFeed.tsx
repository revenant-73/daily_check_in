"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Heart, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  playerName: string;
  type: 'check-in' | 'review' | 'reaction';
  goal?: string;
  readiness?: number;
  timestamp: Date;
}

export function ActivityFeed({
  activities,
  showHeader = true,
  className,
}: {
  activities: ActivityItem[];
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(showHeader ? "glass-card rounded-[2.5rem] p-8 space-y-6" : "space-y-6", className)}>
      {showHeader && (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Activity Feed</h3>
          <div className="w-2 h-2 rounded-full bg-vibrant animate-pulse shadow-[0_0_8px_var(--vibrant)]" />
        </div>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity, i) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 p-4 rounded-3xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group"
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
              activity.type === 'check-in' ? "bg-primary/10 text-primary" :
              activity.type === 'review' ? "bg-vibrant/10 text-vibrant" : "bg-accent/10 text-accent"
            )}>
              {activity.type === 'check-in' ? <Zap className="w-5 h-5" /> :
               activity.type === 'review' ? <Target className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                  {activity.playerName.split(' ')[0].toUpperCase()}
                </p>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                {activity.type === 'check-in' ? `Set goal: ${activity.goal}` :
                 activity.type === 'review' ? "Completed post-practice review" : "Received a reaction from coach"}
              </p>
            </div>
          </motion.div>
        ))}
        {activities.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
