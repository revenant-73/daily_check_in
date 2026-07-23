"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamQRCodeProps {
  teamName: string;
}

export function TeamQRCode({ teamName }: TeamQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const checkInUrl = `${baseUrl}/dashboard?view=check-in`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20"
      >
        <QrCode className="w-4 h-4" />
        Team Check-In
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl text-center"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-2 mb-8 mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Team Mode</p>
                <h2 className="text-3xl font-black tracking-tighter uppercase">{teamName}</h2>
                <p className="text-sm text-muted-foreground font-medium">Scan to check-in for practice</p>
              </div>

              <div className="bg-white p-6 rounded-3xl inline-block shadow-inner mb-8">
                {baseUrl && (
                  <QRCodeSVG 
                    value={checkInUrl} 
                    size={240}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Direct Link</p>
                  <p className="text-xs font-bold text-foreground break-all">{checkInUrl}</p>
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                  &quot;Your intent defines your impact.&quot;
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
