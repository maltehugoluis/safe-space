"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, RefreshCw, X, FileText } from "lucide-react";

type Letter = {
  id: string;
  trigger: string;
  title: string;
  preview: string;
  content: string;
  category: "calm" | "love" | "worth";
};

const LETTERS: Letter[] = [
  {
    id: "overwhelmed",
    category: "calm",
    trigger: "du Überforderung spürst",
    title: "Lies das, wenn alles zu viel wird.",
    preview: "Schließe kurz die Augen. Du musst jetzt gerade gar nichts tun...",
    content: "Hey, mein Schatz. Wenn du das hier liest, fühlt sich die Welt wahrscheinlich gerade laut, schwer und überwältigend an. Das ist okay. Setz dich kurz hin, lass deine Schultern sinken und atme einmal tief durch. Du musst jetzt in diesem Moment absolut nichts lösen, keine Probleme klären und keine Erwartungen erfüllen. Die Welt darf kurz warten. Ich bin stolz auf dich, dass du da bist, genau so wie du bist. Nimm dir alle Zeit der Welt. Ich bin für dich da.",
  },
  {
    id: "worthless",
    category: "worth",
    trigger: "du dich wertlos fühlst",
    title: "Lies das, wenn Zweifel kommen.",
    preview: "Du bist so viel mehr als deine Gedanken oder deine Produktivität...",
    content: "Hallo mein Herz. Deine Gedanken flüstern dir gerade vielleicht ein, dass du nicht genug bist oder dass du eine Last wärst. Bitte hör ihnen nicht zu. Sie lügen. Du bist für mich ein wundervoller, wertvoller Mensch – nicht wegen dem, was du leistest, sondern einfach weil es dich gibt. Deine Wärme, dein Lachen und dein ganzes Wesen machen diese Welt so viel schöner. Du bist genug. Gestern, heute und morgen. Vergiss das bitte nie.",
  },
  {
    id: "powerless",
    category: "calm",
    trigger: "du keine Kraft hast",
    title: "Lies das, wenn das Aufstehen schwerfällt.",
    preview: "Es ist vollkommen in Ordnung, heute langsam zu machen...",
    content: "Guten Morgen oder einfach Hallo. Wenn dir heute die Kraft fehlt, überhaupt aus dem Bett aufzustehen oder den Tag zu beginnen: Das ist okay. Manche Tage sind dazu da, um einfach nur zu überstehen. Du musst die Welt heute nicht erobern. Es reicht völlig, wenn du nur atmest, ein Glas Wasser trinkst und liegst. Jede noch so kleine Sekunde zählt. Ich schicke dir ganz viel Ruhe und Wärme. Mach dir keinen Druck, ich bin an deiner Seite.",
  },
];

export default function SoothingCards() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

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
        {LETTERS.map((letter) => (
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
              <Heart className="w-4 h-4 text-beige-500 opacity-60 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-base font-semibold text-foreground/90 pr-6">
              ... {letter.trigger}
            </h3>
            <p className="text-xs text-foreground/50 line-clamp-1 italic">
              {letter.preview}
            </p>
          </motion.button>
        ))}
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
                <span className="flex items-center gap-0.5 text-beige-600 dark:text-beige-400 font-semibold">
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
