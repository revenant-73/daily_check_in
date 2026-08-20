"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  BookOpen, 
  Users, 
  Shield,
  Activity,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "home";
  const isFocusedPlayerFlow =
    role === "player" &&
    ((pathname === "/dashboard" && (view === "check-in" || view === "review")) ||
      pathname === "/check-in");

  const getNavItems = () => {
    if (role === "admin") {
      return [
        { label: "Admin", href: "/admin", icon: Shield, active: pathname === "/admin" },
        { label: "Player", href: "/dashboard?preview=true", icon: Users, active: pathname === "/dashboard" },
      ];
    }

    if (role === "coach") {
      return [
        { label: "Dashboard", href: "/coach/dashboard", icon: Activity, active: pathname === "/coach/dashboard" },
      ];
    }

    // Player (Default)
    return [
      { 
        label: "Home", 
        href: "/dashboard", 
        icon: LayoutDashboard, 
        active: pathname === "/dashboard" && view === "home" 
      },
      { 
        label: "Check-In", 
        href: "/dashboard?view=check-in", 
        icon: ClipboardList, 
        active: view === "check-in" 
      },
      { 
        label: "Review", 
        href: "/dashboard?view=review", 
        icon: Star, 
        active: view === "review" 
      },
      { 
        label: "History", 
        href: "/dashboard?view=history", 
        icon: History, 
        active: view === "history" 
      },
      { 
        label: "Guide", 
        href: "/dashboard?view=resources", 
        icon: BookOpen, 
        active: view === "resources" 
      },
    ];
  };

  const navItems = getNavItems();

  if (isFocusedPlayerFlow) {
    return null;
  }

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] min-h-20 z-50 flex items-center shadow-[0_-12px_30px_rgba(0,0,0,0.35)]",
      navItems.length > 1 ? "justify-around" : "justify-center"
    )}>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "flex min-h-12 min-w-12 flex-col items-center justify-center rounded-xl px-2 transition-colors",
            item.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className={cn("w-5 h-5 mb-0.5", item.active && "fill-primary/10")} />
          <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
