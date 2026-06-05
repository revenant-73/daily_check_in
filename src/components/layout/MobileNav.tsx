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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "home";

  const getNavItems = () => {
    if (role === "admin") {
      return [
        { label: "Admin", href: "/admin", icon: Shield, active: pathname === "/admin" },
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

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border px-6 py-3 z-50 flex items-center safe-area-bottom",
      navItems.length > 1 ? "justify-between" : "justify-center"
    )}>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className={cn("w-6 h-6", item.active && "fill-primary/10")} />
          <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
