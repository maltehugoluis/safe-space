"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RefreshCw, Wind } from "lucide-react";

type BreathTechnique = {
  name: string;
  description: string;
  steps: { action: "ein" | "halt" | "aus"; duration: number; text: string }[];
};

const TECHNIQUES: BreathTechnique[] = [
  {
    name: "Box-Breathing (4-4-4-4)",
    description: "Ideal zur schnellen Beruhigung bei starker Anspannung.",
    steps: [
      { action: "ein", duration: 4, text: "Atme ruhig ein..." },
      { action: "halt", duration: 4, text: "Halte den Atem..." },
      { action: "aus", duration: 4, text: "Atme langsam aus..." },
      { action: "halt", duration: 4, text: "Halte den Atem..." },
    ],
  },
  {
    name: "4-7-8 Technik",
    description: "Tiefenentspannung zur Linderung von Panik & Einschlafhilfe.",
    steps: [
      { action: "ein", duration: 4, text: "Atme ruhig ein..." },
      { action: "halt", duration: 7, text: "Halte den Atem..." },
      { action: "aus", duration: 8, text: "Atme langsam aus..." },
    ],
  },
];

export default function BreathingHelper() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const technique = TECHNIQUES[selectedIdx];
  const currentStep = technique.steps[stepIdx];

  // Reset state when technique changes
  useEffect(() => {
    setIsPlaying(false);
    setStepIdx(0);
    setTimeLeft(technique.steps[0].duration);
  }, [selectedIdx]);

  // Main breathing cycle timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Go to next step
        const nextStepIdx = (stepIdx + 1) % technique.steps.length;
        setStepIdx(nextStepIdx);
        setTimeLeft(technique.steps[nextStepIdx].duration);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, stepIdx, technique]);

  const handleStartStop = () => {
    if (!isPlaying) {
      // Start
      setIsPlaying(true);
    } else {
      // Pause
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(0);
    setTimeLeft(technique.steps[0].duration);
  };

  // Determine the scale of the circle based on the step action
  const getCircleScale = () => {
    if (!isPlaying) return 1.0;
    
    const action = currentStep.action;
    const duration = currentStep.duration;
    const elapsed = duration - timeLeft;
    const progress = elapsed / duration;

    if (action === "ein") {
      // Scale from 1.0 to 1.8
      return 1.0 + progress * 0.8;
    } else if (action === "halt") {
      // Hold at max size
      return 1.8;
    } else {
      // Scale from 1.8 down to 1.0
      return 1.8 - progress * 0.8;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Technique Selector */}
      <div className="w-full bg-card border border-border rounded-2xl p-2 flex gap-1 mb-8">
        {TECHNIQUES.map((tech, idx) => (
          <button
            key={tech.name}
            onClick={() => setSelectedIdx(idx)}
            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
              selectedIdx === idx
                ? "bg-sage-500 text-white shadow-sm"
                : "text-foreground/75 hover:bg-sage-100 dark:hover:bg-sage-900/40"
            }`}
          >
            {tech.name}
          </button>
        ))}
      </div>

      {/* Breathing Guide Info */}
      <div className="text-center mb-6 h-12 flex flex-col justify-center">
        <p className="text-sm text-foreground/70 italic px-4">
          {isPlaying ? "" : technique.description}
        </p>
      </div>

      {/* Visual Breathing Ring */}
      <div className="relative w-72 h-72 flex items-center justify-center mb-8">
        {/* Glow behind the circle */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute inset-[-100%] pointer-events-none"
              style={{
                background: "radial-gradient(circle, var(--color-sage-400) 0%, transparent 60%)"
              }}
            />
          )}
        </AnimatePresence>

        {/* Animated breathing circle */}
        <motion.div
          animate={{
            scale: getCircleScale(),
          }}
          transition={{
            duration: isPlaying ? 1.0 : 0.5,
            ease: "easeInOut",
          }}
          className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border shadow-lg ${
            currentStep?.action === "ein"
              ? "bg-sage-100 border-sage-300 text-sage-800 dark:bg-sage-900/60 dark:border-sage-700 dark:text-sage-300"
              : currentStep?.action === "halt"
              ? "bg-sage-100 border-sage-300 text-sage-800 dark:bg-sage-900/60 dark:border-sage-800 dark:text-sage-300"
              : "bg-sage-50 border-sage-200 text-sage-700 dark:bg-sage-950/60 dark:border-sage-900 dark:text-sage-400"
          }`}
        >
          <Wind className="w-8 h-8 opacity-75 mb-1" />
          <span className="text-2xl font-bold font-mono">{timeLeft}s</span>
        </motion.div>

        {/* Outer Ring boundary */}
        <div className="absolute w-64 h-64 border border-border border-dashed rounded-full pointer-events-none opacity-40" />
      </div>

      {/* Instruction text */}
      <div className="h-16 text-center mb-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? `${stepIdx}-${timeLeft}` : "idle"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-medium tracking-wide">
              {isPlaying ? currentStep.text : "Bereit zum Durchatmen?"}
            </h3>
            {isPlaying && (
              <p className="text-xs text-foreground/50 uppercase tracking-widest mt-1">
                {currentStep.action === "ein"
                  ? "Einatmen"
                  : currentStep.action === "halt"
                  ? "Atem halten"
                  : "Ausatmen"}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          disabled={!isPlaying && stepIdx === 0 && timeLeft === technique.steps[0].duration}
          className="p-3 rounded-full border border-border bg-card text-foreground hover:bg-sage-50 dark:hover:bg-sage-950 disabled:opacity-40 disabled:pointer-events-none transition-all"
          title="Zurücksetzen"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button
          onClick={handleStartStop}
          className={`px-8 py-3 rounded-full font-medium flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 ${
            isPlaying
              ? "bg-sage-600 text-white hover:bg-sage-700"
              : "bg-sage-600 text-white hover:bg-sage-700"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Starten
            </>
          )}
        </button>
      </div>
    </div>
  );
}
