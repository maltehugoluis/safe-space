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
import Settings from "@/components/Settings";
import ThoughtShredder from "@/components/ThoughtShredder";
import GoodMomentsJar from "@/components/GoodMomentsJar";
import SupporterNudge from "@/components/SupporterNudge";
import SupporterLetters from "@/components/SupporterLetters";
import { supabase } from "@/lib/supabase";

type Tab = "ruhe" | "safespace" | "journal" | "hilfe" | "settings" | "nudge" | "briefe";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ruhe");
  const [appMode, setAppMode] = useState<"receiver" | "supporter">("receiver");
  const [linkedEmail, setLinkedEmail] = useState("");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("app_mode, linked_user_email")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setAppMode(data.app_mode || "receiver");
          setLinkedEmail(data.linked_user_email || "");
          if (data.app_mode === "supporter") {
            setActiveTab("nudge");
          }
        }
      } catch (err) {
        console.error("Error fetching profile mode:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

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
          <span className="text-xs uppercase tracking-widest text-foreground/50 font-bold">
            {appMode === "supporter" ? "Supporter-Modus" : "Rückzugsort"}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl font-bold tracking-tight text-foreground/90 font-serif"
        >
          {appMode === "supporter" ? "Unterstütze deine Lieblingsperson" : "Schön, dass du da bist. 🤍"}
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

                {/* Thought Shredder */}
                <ThoughtShredder />
              </div>
            )}

            {activeTab === "safespace" && (
              <div className="flex flex-col gap-8">
                {/* Soothing cards from partner */}
                <SoothingCards />
                
                {/* Memory gallery */}
                <MemoryGallery />

                {/* Jar of Good Moments */}
                <GoodMomentsJar />
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

            {/* SUPPORTER TABS */}
            {activeTab === "nudge" && appMode === "supporter" && (
              <SupporterNudge linkedEmail={linkedEmail} />
            )}
            
            {activeTab === "briefe" && appMode === "supporter" && (
              <SupporterLetters linkedEmail={linkedEmail} />
            )}

            {activeTab === "settings" && (
              <div className="flex flex-col gap-8">
                <Settings />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Nav Bar */}
      <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-card/85 backdrop-blur-md border border-border rounded-full p-2.5 shadow-xl z-40 flex justify-around items-center">
        {appMode === "receiver" ? (
          <>
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
          </>
        ) : (
          <>
            {/* Supporter Nudge */}
            <button
              onClick={() => setActiveTab("nudge")}
              className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
                activeTab === "nudge"
                  ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/40"
                  : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Nudge</span>
            </button>

            {/* Supporter Letters */}
            <button
              onClick={() => setActiveTab("briefe")}
              className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
                activeTab === "briefe"
                  ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/40"
                  : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Briefe</span>
            </button>
          </>
        )}

        {/* Settings */}
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all relative ${
            activeTab === "settings"
              ? "text-sage-700 dark:text-sage-300 bg-sage-50 dark:bg-sage-950/20"
              : "text-foreground/50 hover:text-foreground/80"
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span className="text-[9px] font-bold mt-1 tracking-wider uppercase">Profil</span>
        </button>
      </nav>
    </div>
  );
}
