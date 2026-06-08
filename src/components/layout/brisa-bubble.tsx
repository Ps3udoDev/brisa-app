"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "motion/react";
import { getRandomBrisaQuote } from "@/lib/brisa-quotes";

function useTypewriter(text: string, speed: number = 40) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed("");
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isDone };
}

interface BrisaBubbleProps {
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export function BrisaBubble({ children, position = "top" }: BrisaBubbleProps) {
  const [quote, setQuote] = useState<string | null>(null);
  const { displayed, isDone } = useTypewriter(quote ?? "", 35);

  const handleClick = useCallback(() => {
    setQuote(getRandomBrisaQuote());
  }, []);

  // Auto-hide después de completar + 3 segundos
  useEffect(() => {
    if (!isDone || !quote) return;
    const timeout = setTimeout(() => setQuote(null), 3000);
    return () => clearTimeout(timeout);
  }, [isDone, quote]);

  return (
    <div className="relative inline-block" onClick={handleClick}>
      {children}

      <AnimatePresence>
        {quote && (
          <m.div
            initial={{ opacity: 0, y: position === "top" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 10 : -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`absolute left-1/2 -translate-x-1/2 z-50 w-52 ${
              position === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <div className="relative bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-xl border border-slate-700/50">
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {displayed}
                {!isDone && (
                  <span className="inline-block w-1.5 h-3.5 bg-slate-400 ml-0.5 animate-pulse align-middle" />
                )}
              </p>
              {/* Flecha */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 dark:bg-slate-950/90 border-slate-700/50 rotate-45 ${
                  position === "top"
                    ? "-bottom-1 border-b border-r"
                    : "-top-1 border-t border-l"
                }`}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
