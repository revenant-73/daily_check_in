"use client";

import React, { useState, useEffect } from "react";
import { Share, PlusSquare, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Determine iOS and Standalone status
    // We use setTimeout to defer state updates to the next tick, avoiding cascading render warnings
    const timer = setTimeout(() => {
      const nav = window.navigator as Navigator & { standalone?: boolean; MSStream?: unknown };
      const isIosDevice = /iPhone|iPad|iPod/.test(nav.userAgent) && !nav.MSStream;
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
      
      const lastPrompted = localStorage.getItem("lastInstallPrompt");
      const now = new Date().getTime();
      const shouldShow = !isStandaloneMode && (!lastPrompted || now - parseInt(lastPrompted) > 1000 * 60 * 60 * 24 * 7);

      setIsIos(isIosDevice);
      setIsStandalone(isStandaloneMode);
      if (shouldShow) {
        setShowPrompt(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("lastInstallPrompt", new Date().getTime().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="glass-card rounded-[2.5rem] p-6 border-primary/20 bg-primary/5 relative overflow-hidden"
      >
        <button 
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex gap-6 items-start">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight uppercase">Install as App</h3>
              <p className="text-sm text-muted-foreground font-medium">Get faster access and stay logged in by adding this to your home screen.</p>
            </div>

            {isIos ? (
              <div className="space-y-3 p-4 bg-background/50 rounded-2xl border border-border">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">1</div>
                  <p>Tap the <Share className="w-4 h-4 inline mx-1 text-blue-500" /> share icon below</p>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">2</div>
                  <p>Scroll down and tap <PlusSquare className="w-4 h-4 inline mx-1" /> &quot;Add to Home Screen&quot;</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border text-sm font-bold">
                <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">!</div>
                <p>Tap your browser menu and select &quot;Install App&quot; or &quot;Add to Home Screen&quot;</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
