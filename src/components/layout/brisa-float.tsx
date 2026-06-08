"use client";

import { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import { PawPrint, X } from "lucide-react";
import { BrisaBubble } from "./brisa-bubble";

export function BrisaFloat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <m.div
            key="brisa-card"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 w-44"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <BrisaBubble position="top">
                <img
                  src="/brisa-sitting.gif"
                  alt="Brisa"
                  className="w-28 h-auto object-contain cursor-pointer"
                />
              </BrisaBubble>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Brisa
              </p>
            </m.div>
          </m.div>
        ) : (
          <m.button
            key="brisa-trigger"
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center"
          >
            <PawPrint className="w-6 h-6" />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}
