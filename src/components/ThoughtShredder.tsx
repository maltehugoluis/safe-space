"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trash2, Wind } from "lucide-react";

export default function ThoughtShredder() {
  const [text, setText] = useState("");
  const [isShredding, setIsShredding] = useState(false);

  const handleShred = () => {
    if (!text.trim()) return;
    
    setIsShredding(true);
    
    // After animation finishes, clear the text and reset state
    setTimeout(() => {
      setText("");
      setIsShredding(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-3 bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative">
      <h2 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-3 w-full">
        <Flame className="w-4 h-4 text-orange-500" />
        Gedanken-Schredder
      </h2>
      <p className="text-xs text-foreground/50 leading-relaxed">
        Schreib hier alles auf, was dich gerade stresst, ängstigt oder wütend macht. Klicke dann auf "Loslassen". Es wird nirgendwo gespeichert – nur vernichtet.
      </p>

      <div className="relative mt-2 h-32">
        <AnimatePresence>
          {!isShredding ? (
            <motion.div
              key="textarea"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: [1, 1, 0], 
                y: [0, -10, -30], 
                scale: [1, 0.95, 0.8], 
                filter: ["blur(0px) brightness(1)", "blur(2px) brightness(1.5)", "blur(8px) brightness(0.5) grayscale(100%)"],
                transition: { duration: 1.8, ease: "easeIn" }
              }}
              className="absolute inset-0 w-full h-full"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Meine rasenden Gedanken..."
                className="w-full h-full p-4 rounded-2xl border border-border bg-background focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-300 resize-none text-sm"
              />
              <button
                onClick={handleShred}
                disabled={!text.trim()}
                className="absolute bottom-3 right-3 bg-foreground text-background disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Loslassen
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="particles"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full h-full">
                {/* Fire / Ash particles animation */}
                {[...Array(40)].map((_, i) => {
                  const size = Math.random() * 8 + 4;
                  const isAsh = Math.random() > 0.5;
                  const colors = isAsh 
                    ? ["#555555", "#333333", "#111111"] 
                    : ["#ffb347", "#ff5500", "#ff0000"];
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 0, 
                        y: 100 + Math.random() * 20, 
                        x: `${5 + Math.random() * 90}%`,
                        scale: 0.5 
                      }}
                      animate={{ 
                        opacity: [0, 1, 0], 
                        y: -20 - Math.random() * 120, 
                        x: `${5 + Math.random() * 90 + (Math.random() - 0.5) * 30}%`,
                        scale: [0.5, 1.5, 0],
                        backgroundColor: colors
                      }}
                      transition={{ 
                        duration: 1.5 + Math.random() * 1, 
                        ease: "easeOut",
                        delay: Math.random() * 0.4
                      }}
                      className="absolute rounded-full mix-blend-screen dark:mix-blend-lighten"
                      style={{ 
                        width: size, 
                        height: size,
                        boxShadow: isAsh ? "none" : "0 0 12px 3px rgba(255,85,0,0.6)",
                        bottom: 0
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
