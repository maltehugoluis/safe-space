"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Play, RotateCcw, Check, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function SomaticShake() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && !isFinished) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      } else {
        setIsFinished(true);
        setIsActive(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, timeLeft, isFinished]);

  const handleStart = () => {
    setTimeLeft(30);
    setIsFinished(false);
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(30);
    setIsFinished(false);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600 dark:text-sage-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Stress abschütteln (Somatisch)</h3>
            <p className="text-xs text-foreground/60">30 Sekunden Schüttel-Übung zur Cortisol-Reduktion</p>
          </div>
        </div>

        {isActive && (
          <button
            onClick={handleReset}
            className="p-2 text-foreground/40 hover:text-foreground hover:bg-muted rounded-full transition-all"
            title="Zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!isActive && !isFinished ? (
        <div className="flex flex-col gap-4 items-center text-center py-4">
          <p className="text-xs text-foreground/70 leading-relaxed max-w-md">
            In der Traumatherapie erwiesen: <span className="font-bold text-foreground">Schütteln baut überschüssige Stress-Energie und Cortisol ab</span>. Schüttle deine Hände, Arme und Beine 30 Sek. kräftig aus!
          </p>
          <button
            onClick={handleStart}
            className="px-6 py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> 30-Sek. Shake starten 🐥
          </button>
        </div>
      ) : isFinished ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-3 text-center py-6"
        >
          <div className="w-12 h-12 rounded-full bg-sage-100 dark:bg-sage-950/50 flex items-center justify-center text-sage-600 dark:text-sage-400">
            <Check className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-foreground">Körperliche Anspannung gelöst! 🍃</h4>
          <p className="text-xs text-foreground/60 max-w-sm">
            Wunderbar. Atme jetzt einmal ganz tief durch die Nase ein und lange durch den Mund aus.
          </p>
          <button
            onClick={handleStart}
            className="mt-2 text-xs font-bold text-sage-600 dark:text-sage-400 underline hover:opacity-80"
          >
            Noch einmal schütteln
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6 items-center text-center py-2">
          {/* Shaking Icon */}
          <motion.div
            animate={{
              rotate: [-8, 8, -6, 6, -10, 10, 0],
              x: [-6, 6, -4, 4, -8, 8, 0],
              y: [-3, 3, -2, 2, -4, 4, 0],
            }}
            transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
            className="w-24 h-24 rounded-full bg-sage-500/10 border-2 border-sage-500/50 flex items-center justify-center text-sage-600 dark:text-sage-400 shadow-lg"
          >
            <Zap className="w-12 h-12 fill-sage-500/20" />
          </motion.div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold text-foreground font-mono">
              {timeLeft}s
            </span>
            <p className="text-sm font-bold text-sage-600 dark:text-sage-400 animate-pulse mt-1">
              SCHÜTTLE DEINE HÄNDE & ARME AUS! 👋
            </p>
          </div>

          <p className="text-xs text-foreground/60 max-w-xs">
            Lass deine Schultern hängen, lockere den Kiefer und bewege deinen ganzen Körper!
          </p>

          {/* Progress bar */}
          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-sage-600 h-full transition-all duration-300"
              style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
