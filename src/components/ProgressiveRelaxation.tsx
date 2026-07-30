"use client";

import React, { useState, useEffect } from "react";
import { Activity, Play, RotateCcw, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PMRStep {
  title: string;
  part: string;
  tenseInstruction: string;
  releaseInstruction: string;
}

const PMR_STEPS: PMRStep[] = [
  {
    title: "1. Hände & Arme",
    part: "Fäuste ballen",
    tenseInstruction: "Balle beide Fäuste so fest du kannst zusammen!",
    releaseInstruction: "Lass jetzt schlagartig komplett locker... Spüre die Wärme.",
  },
  {
    title: "2. Schultern & Nacken",
    part: "Schultern hochziehen",
    tenseInstruction: "Ziehe deine Schultern hoch Richtung Ohren und halte die Spannung!",
    releaseInstruction: "Lass die Schultern tief nach unten fallen... Tief durchatmen.",
  },
  {
    title: "3. Gesicht & Kiefer",
    part: "Gesicht anspannen",
    tenseInstruction: "Kneife die Augen zusammen und beiße leicht die Zähne zusammen!",
    releaseInstruction: "Lass den Kiefer ganz weich werden. Entspanne deine Stirn.",
  },
  {
    title: "4. Bauch & Beine",
    part: "Körpermitte anspannen",
    tenseInstruction: "Spanne deinen Bauch fest an und drücke die Fersen in den Boden!",
    releaseInstruction: "Lass alle Muskeln vollkommen schlaff und entspannt werden.",
  },
];

const TENSE_DURATION = 5; // seconds
const RELEASE_DURATION = 10; // seconds

export default function ProgressiveRelaxation() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [phase, setPhase] = useState<"tense" | "release">("tense");
  const [timeLeft, setTimeLeft] = useState(TENSE_DURATION);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && !isFinished) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      } else {
        // Switch phase or advance step
        if (phase === "tense") {
          setPhase("release");
          setTimeLeft(RELEASE_DURATION);
        } else {
          if (currentStepIdx < PMR_STEPS.length - 1) {
            setCurrentStepIdx((prev) => prev + 1);
            setPhase("tense");
            setTimeLeft(TENSE_DURATION);
          } else {
            setIsFinished(true);
            setIsActive(false);
          }
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, timeLeft, phase, currentStepIdx, isFinished]);

  const handleStart = () => {
    setCurrentStepIdx(0);
    setPhase("tense");
    setTimeLeft(TENSE_DURATION);
    setIsFinished(false);
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentStepIdx(0);
    setPhase("tense");
    setTimeLeft(TENSE_DURATION);
    setIsFinished(false);
  };

  const step = PMR_STEPS[currentStepIdx];
  const progressPercent = ((currentStepIdx * 15 + (phase === "tense" ? (5 - timeLeft) : (5 + 10 - timeLeft))) / 60) * 100;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Progressive Muskelentspannung</h3>
            <p className="text-xs text-foreground/60">60-Sekunden Entspannungs-Quickie (PMR)</p>
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
            Durch gezieltes **5 Sek. Anspannen** und **10 Sek. schlagartiges Loslassen** signalisierst du deinem Gehirn sofortige Entspannung.
          </p>
          <button
            onClick={handleStart}
            className="px-6 py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Übung starten (1 Min)
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
          <h4 className="font-bold text-base text-foreground">Körper spürbar entspannt! ✨</h4>
          <p className="text-xs text-foreground/60 max-w-sm">
            Toll gemacht. Spüre kurz nach, wie sich deine Muskeln jetzt wärmer und schwerer anfüllen.
          </p>
          <button
            onClick={handleStart}
            className="mt-2 text-xs font-bold text-sage-600 dark:text-sage-400 underline hover:opacity-80"
          >
            Noch einmal wiederholen
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6 items-center text-center py-2">
          {/* Step Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
              {step.title}
            </span>
          </div>

          {/* Animated Glow Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <motion.div
              animate={{
                scale: phase === "tense" ? [1, 1.15, 1.1] : [1.1, 0.95, 1],
                borderColor: phase === "tense" ? "rgba(244, 63, 94, 0.8)" : "rgba(34, 197, 94, 0.8)",
              }}
              transition={{ duration: phase === "tense" ? 5 : 10, ease: "linear" }}
              className={`absolute inset-0 rounded-full border-4 ${
                phase === "tense"
                  ? "bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.3)]"
                  : "bg-emerald-500/10 shadow-[0_0_25px_rgba(34,197,94,0.3)]"
              }`}
            />
            <div className="flex flex-col items-center z-10">
              <span className={`text-xs font-extrabold uppercase tracking-wider ${
                phase === "tense" ? "text-rose-500" : "text-emerald-500"
              }`}>
                {phase === "tense" ? "🔥 ANSPANNEN" : "🍃 LOSLASSEN"}
              </span>
              <span className="text-3xl font-extrabold text-foreground font-mono mt-1">
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Dynamic Instructions */}
          <AnimatePresence mode="wait">
            <motion.p
              key={phase + currentStepIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm font-semibold text-foreground/90 max-w-sm min-h-[40px] leading-relaxed"
            >
              {phase === "tense" ? step.tenseInstruction : step.releaseInstruction}
            </motion.p>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-sage-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
