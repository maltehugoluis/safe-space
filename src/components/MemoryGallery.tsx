"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Heart, X } from "lucide-react";

type Memory = {
  id: string;
  title: string;
  note: string;
  imageSrc: string;
  date: string;
};

const MEMORIES: Memory[] = [
  {
    id: "lake",
    title: "Unser Spaziergang am See",
    note: "Hier war alles ganz ruhig. Wir haben einfach nur auf das glitzernde Wasser geschaut und die kühle Luft eingeatmet. Stell dir vor, wir stehen genau jetzt wieder dort.",
    imageSrc: "/images/soothing_sunset.jpg",
    date: "Herbst 2025",
  },
  {
    id: "forest",
    title: "Der friedliche Waldweg",
    note: "Der Geruch von nadeligem Kiefernholz, Moos und nasser Erde. Die Vögel haben leise gezwitschert. Ein Ort, an dem wir einfach tief durchatmen können.",
    imageSrc: "/images/forest_mist.jpg",
    date: "Frühling 2026",
  },
  {
    id: "ocean",
    title: "Das sanfte Meeresrauschen",
    note: "Nichts als der Horizont, warmer Sand unter den Füßen und das regelmäßige, beruhigende Rollen der Wellen. Lass uns gedanklich dorthin reisen.",
    imageSrc: "/images/ocean_waves.jpg",
    date: "Sommer 2025",
  },
];

export default function MemoryGallery() {
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/85 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-sage-500" />
          Erinnerungs-Galerie
        </h2>
        <p className="text-xs text-foreground/60 leading-relaxed">
          Schöne gemeinsame Augenblicke und friedliche Orte, um dich in stürmischen Zeiten zu erden.
        </p>
      </div>

      {/* Grid of memory cards */}
      <div className="grid grid-cols-2 gap-3">
        {MEMORIES.map((memory) => (
          <motion.button
            key={memory.id}
            onClick={() => setActiveMemory(memory)}
            className="text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-sage-300 dark:hover:border-sage-800 transition-all flex flex-col shadow-sm"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="aspect-[4/3] w-full bg-sage-50 dark:bg-sage-950 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={memory.imageSrc}
                alt={memory.title}
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  // Fallback for missing generated images
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 text-[9px] text-white/90 font-semibold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-[2px]">
                {memory.date}
              </div>
            </div>
            <div className="p-3.5 flex flex-col gap-0.5">
              <h3 className="text-xs font-bold text-foreground/90 line-clamp-1">
                {memory.title}
              </h3>
              <p className="text-[10px] text-foreground/50 line-clamp-2 leading-relaxed">
                {memory.note}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox expanded view */}
      <AnimatePresence>
        {activeMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMemory(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={() => setActiveMemory(null)}
                className="absolute top-4 right-4 p-2 rounded-full border border-border bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full aspect-video bg-sage-50 dark:bg-sage-950 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMemory.imageSrc}
                  alt={activeMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
                    {activeMemory.date}
                  </span>
                  <h3 className="text-base font-bold text-foreground/95 pr-6">
                    {activeMemory.title}
                  </h3>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed font-serif italic border-l-2 border-sage-300 dark:border-sage-700 pl-3.5 py-1">
                  {activeMemory.note}
                </p>

                <div className="flex justify-end mt-2">
                  <span className="text-[10px] text-beige-600 dark:text-beige-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    Für dich festgehalten
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
