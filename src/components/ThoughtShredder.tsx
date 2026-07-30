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
                scale: [1, 0.98, 0.9],
                filter: [
                  "brightness(1) blur(0px) sepia(0)", 
                  "brightness(1.5) blur(2px) sepia(0.8) hue-rotate(-20deg) saturate(4)", 
                  "brightness(0) blur(6px) grayscale(1)"
                ],
                y: [0, 2, -2, 2, -2, -15],
                transition: { duration: 2, ease: "easeInOut" }
              }}
              className="absolute inset-0 w-full h-full origin-bottom"
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
                {/* Giant Flames (blurry blobs) */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`flame-${i}`}
                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                    animate={{ 
                      opacity: [0, 0.9, 0], 
                      y: -80 - Math.random() * 80, 
                      scale: [0.5, 2.5, 1],
                      x: (Math.random() - 0.5) * 50
                    }}
                    transition={{ 
                      duration: 1.2 + Math.random() * 0.8, 
                      ease: "easeIn", 
                      delay: Math.random() * 0.5 
                    }}
                    className="absolute bottom-0 rounded-full mix-blend-screen bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 blur-[14px]"
                    style={{ 
                      width: 50 + Math.random() * 40, 
                      height: 60 + Math.random() * 50, 
                      left: `${5 + (i / 12) * 90}%` 
                    }}
                  />
                ))}

                {/* Flying Embers (bright, fast dots) */}
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={`ember-${i}`}
                    initial={{ opacity: 0, y: 40, x: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: -100 - Math.random() * 150, 
                      x: (Math.random() - 0.5) * 40
                    }}
                    transition={{ 
                      duration: 0.8 + Math.random() * 1.5, 
                      ease: "easeOut", 
                      delay: Math.random() * 1 
                    }}
                    className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_10px_3px_rgba(255,100,0,0.9)]"
                    style={{ left: `${Math.random() * 100}%` }}
                  />
                ))}

                {/* Dark Smoke / Ash */}
                {[...Array(15)].map((_, i) => {
                  const size = Math.random() * 12 + 6;
                  return (
                    <motion.div
                      key={`smoke-${i}`}
                      initial={{ 
                        opacity: 0, 
                        y: 80, 
                        x: 0,
                        scale: 0.5 
                      }}
                      animate={{ 
                        opacity: [0, 0.4, 0], 
                        y: -150 - Math.random() * 100, 
                        x: (Math.random() - 0.5) * 60,
                        scale: [0.5, 3, 5],
                        rotate: Math.random() * 360
                      }}
                      transition={{ 
                        duration: 2 + Math.random() * 1.5, 
                        ease: "easeOut",
                        delay: 0.5 + Math.random() * 0.8
                      }}
                      className="absolute bottom-0 rounded-full bg-[#111111] blur-[6px]"
                      style={{ 
                        width: size, 
                        height: size,
                        left: `${Math.random() * 100}%`
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
