"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, RefreshCw, X, FileText } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Letter = {
  id: string;
  trigger: string;
  title: string;
  preview: string;
  content: string;
};

export default function SoothingCards() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // We need the user's email to fetch cards directed to them
      const { data, error } = await supabase
        .from("soothing_cards")
        .select("*")
        .eq("receiver_email", session.user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (err) {
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/85 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sage-500" />
          Lies das, wenn...
        </h2>
        <p className="text-xs text-foreground/60 leading-relaxed">
          Wähle eine Karte aus, wenn du Zuspruch und beruhigende Worte brauchst.
        </p>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center p-4"><RefreshCw className="w-5 h-5 animate-spin text-sage-500 mx-auto" /></div>
        ) : letters.length === 0 ? (
          <div className="text-center p-6 bg-card border border-dashed border-border rounded-2xl">
            <p className="text-xs text-foreground/50">Es gibt noch keine Briefe für dich.</p>
          </div>
        ) : (
          letters.map((letter) => (
            <motion.button
              key={letter.id}
            onClick={() => setSelectedLetter(letter)}
            className="w-full text-left p-5 rounded-2xl border border-border bg-card hover:border-sage-300 dark:hover:border-sage-800 transition-all flex flex-col gap-2 relative overflow-hidden group shadow-sm"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                Lies das, wenn...
              </span>
              <Heart className="w-4 h-4 text-sage-500 opacity-60 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-foreground/90 pr-6">
              ... {letter.trigger}
            </h3>
            <p className="text-xs text-foreground/50 line-clamp-1 italic">
              {letter.preview}
            </p>
          </motion.button>
          ))
        )}
      </div>

      {/* Expanded letter modal */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLetter(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-8 shadow-2xl z-10 flex flex-col gap-6"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute top-4 right-4 p-2 rounded-full border border-border bg-background text-foreground/60 hover:bg-sage-50 dark:hover:bg-sage-950 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Letter Header */}
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-sage-600 dark:text-sage-400">
                  Lies das, wenn...
                </span>
                <h3 className="text-lg font-bold pr-6 leading-tight">
                  ... {selectedLetter.trigger}
                </h3>
              </div>

              {/* Letter Body */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-foreground/80 leading-relaxed font-serif whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
              </div>

              {/* Letter Footer */}
              <div className="flex justify-between items-center text-[10px] text-foreground/50 border-t border-border pt-4 mt-2">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Für dich geschrieben
                </span>
                <span className="flex items-center gap-0.5 text-sage-600 dark:text-sage-400 font-semibold">
                  In Liebe ❤️
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
