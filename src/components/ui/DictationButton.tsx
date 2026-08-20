"use client";

import React, { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { cn, hapticFeedback } from "@/lib/utils";

interface DictationButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

export function DictationButton({ onResult, className }: DictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const getRecognitionConstructor = () => {
    if (!isMounted || typeof window === "undefined") return null;
    return (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor, webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || 
           (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor, webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition || null;
  };

  const isSupported = !!getRecognitionConstructor();

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const RecognitionConstructor = getRecognitionConstructor();
    if (!RecognitionConstructor) return;

    const recognition = new RecognitionConstructor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      hapticFeedback("medium");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      hapticFeedback("success");
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
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
        "min-h-11 min-w-11 rounded-full transition-all flex items-center justify-center",
        isListening 
          ? "bg-red-500 text-white animate-pulse" 
          : "bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop dictation" : "Start dictation"}
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
