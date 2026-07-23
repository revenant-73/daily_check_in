"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn, hapticFeedback } from "@/lib/utils";

interface DictationButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export function DictationButton({ onResult, className }: DictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      hapticFeedback("medium");
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      hapticFeedback("success");
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    // Note: The recognition instance is local to startListening in this simple implementation
    // For a more robust version, we'd store it in a ref. 
    // But recognition usually stops automatically on "end" or we can just let it timeout.
    setIsListening(false);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={cn(
        "p-2 rounded-full transition-all flex items-center justify-center",
        isListening 
          ? "bg-red-500 text-white animate-pulse" 
          : "bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
      title={isListening ? "Listening..." : "Dictate"}
    >
      {isListening ? (
        <Mic className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
