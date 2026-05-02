"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X, User, Shield, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
  userName?: string | null;
  role?: string;
  teamName?: string;
  href?: string;
}

export function Header({ userName, role, teamName, href = "/dashboard" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 items-center">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-foreground">{userName || "User"}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">{role}</span>
          </div>
          <Link 
            href="/api/auth/signout"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-lg"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 z-40">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground">{userName || "User"}</p>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{role}</p>
                {teamName && <p className="text-[10px] text-primary font-bold">{teamName}</p>}
              </div>
            </div>
            
            <nav className="space-y-1">
              <Link 
                href={href}
                className="flex items-center gap-3 p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors font-bold text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link 
                href="/api/auth/signout"
                className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
