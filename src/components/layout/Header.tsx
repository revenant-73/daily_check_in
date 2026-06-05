import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
  userName?: string | null;
  role?: string;
  teamName?: string;
  href?: string;
}

export function Header({ userName, role, teamName, href = "/dashboard" }: HeaderProps) {

  return (
    <header className="bg-card border-b border-border p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Logo href={href} />
          <div className="hidden md:block h-8 w-px bg-border" />
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-foreground capitalize">{role} Dashboard</h1>
            {teamName && (
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{teamName}</p>
            )}
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-foreground">{userName || "User"}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">{role}</span>
          </div>
          <Link 
            href="/api/auth/signout"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg flex items-center gap-2"
            title="Sign Out"
          >
            <span className="text-xs font-bold md:hidden">Sign Out</span>
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
