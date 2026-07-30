"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Heart, BookOpen, ShieldAlert, Sparkles, Smile } from "lucide-react";
import BreathingHelper from "@/components/BreathingHelper";
import GroundingGuide from "@/components/GroundingGuide";
import SoothingCards from "@/components/SoothingCards";
import MemoryGallery from "@/components/MemoryGallery";
import JournalTracker from "@/components/JournalTracker";
import EmergencySignal from "@/components/EmergencySignal";
import EmergencyContacts from "@/components/EmergencyContacts";

type Tab = "ruhe" | "safespace" | "journal" | "hilfe";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ruhe");

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Top Welcome Header */}
      <header className="flex flex-col gap-1 text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center items-center gap-1.5"
        >
          <span className="text-xs uppercase tracking-widest text-foreground/50 font-bold">Rückzugsort</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl font-bold tracking-tight text-foreground/90 font-serif"
        >
          Schön, dass du da bist. 🤍
        </motion.h1>
      </header>

      {/* Main Content Area with dynamic views */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col gap-8 pb-12"
          >
            {activeTab === "ruhe" && (
              <div className="flex flex-col gap-8">
                {/* Breathing Section */}
                <div className="flex flex-col gap-3 bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-3 w-full">
                    <Wind className="w-4 h-4 text-sage-500" />
                    Pulsierende Atemhilfe
                  </h2>
                  <BreathingHelper />
                </div>

                {/* Grounding Section */}
                <GroundingGuide />
              </div>
            )}

            {activeTab === "safespace" && (
              <div className="flex flex-col gap-8">
                {/* Soothing cards from partner */}
                <SoothingCards />
                
                {/* Memory gallery */}
                <MemoryGallery />
              </div>
            )}

            {activeTab === "journal" && (
              <div className="flex flex-col gap-8">
                {/* Mood tracking & private thoughts dump */}
                <JournalTracker />
              </div>
            )}

            {activeTab === "hilfe" && (
              <div className="flex flex-col gap-8">
                {/* Lautloses webhook signal */}
                <EmergencySignal />

                {/* Emergency Hotlines / Personal contacts */}
                <EmergencyContacts />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Nav Bar */}
      <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-card/85 backdrop-blur-md border border-border rounded-full p-2.5 shadow-xl z-40 flex justify-around items-center">
        {/* Ruhe / Grounding */}
        <button
          onClick={() => setActiveTab("ruhe")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
            activeTab === "ruhe"
              ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/40"
              : "text-foreground/50 hover:text-foreground/80"
          }`}
        >
          <Wind className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Ruhe</span>
        </button>

        {/* Safe Space / Letters */}
        <button
          onClick={() => setActiveTab("safespace")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
            activeTab === "safespace"
              ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/40"
              : "text-foreground/50 hover:text-foreground/80"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Safe Space</span>
        </button>

        {/* Tagebuch / Journal */}
        <button
          onClick={() => setActiveTab("journal")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
            activeTab === "journal"
              ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/40"
              : "text-foreground/50 hover:text-foreground/80"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Tagebuch</span>
        </button>

        {/* Emergency help */}
        <button
          onClick={() => setActiveTab("hilfe")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
            activeTab === "hilfe"
              ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/20"
              : "text-foreground/50 hover:text-foreground/80"
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Hilfe</span>
        </button>
      </nav>
    </div>
  );
}
