"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, CloudRain, Waves, Flame, Radio, Play, Square } from "lucide-react";
import { motion } from "framer-motion";

type SoundType = "rain" | "waves" | "fire" | "wind";

interface SoundTrack {
  id: SoundType;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  active: boolean;
  volume: number;
  url: string;
}

export default function SoundscapeGenerator() {
  const [tracks, setTracks] = useState<SoundTrack[]>([
    {
      id: "rain",
      name: "Sanfter Regen",
      subtitle: "Echter Landregen",
      icon: <CloudRain className="w-5 h-5 text-sage-600 dark:text-sage-400" />,
      active: false,
      volume: 0.6,
      url: "https://actions.google.com/sounds/v1/weather/light_rain.ogg",
    },
    {
      id: "waves",
      name: "Meeresrauschen",
      subtitle: "Sanfte Brandung",
      icon: <Waves className="w-5 h-5 text-sage-600 dark:text-sage-400" />,
      active: false,
      volume: 0.6,
      url: "https://actions.google.com/sounds/v1/water/waves_crashing.ogg",
    },
    {
      id: "fire",
      name: "Lagerfeuer",
      subtitle: "Kamin-Knistern",
      icon: <Flame className="w-5 h-5 text-sage-600 dark:text-sage-400" />,
      active: false,
      volume: 0.6,
      url: "https://actions.google.com/sounds/v1/ambiences/fire.ogg",
    },
    {
      id: "wind",
      name: "Tiefe Ruhe",
      subtitle: "Sanfter Wind",
      icon: <Radio className="w-5 h-5 text-sage-600 dark:text-sage-400" />,
      active: false,
      volume: 0.6,
      url: "https://actions.google.com/sounds/v1/ambiences/wind_soft.ogg",
    },
  ]);

  const audioRefs = useRef<{ [key in SoundType]?: HTMLAudioElement }>({});

  useEffect(() => {
    // Preload audio elements
    tracks.forEach((t) => {
      if (!audioRefs.current[t.id]) {
        const audio = new Audio(t.url);
        audio.loop = true;
        audio.preload = "auto";
        audioRefs.current[t.id] = audio;
      }
    });

    return () => {
      // Pause all on unmount
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  const toggleTrack = (id: SoundType) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextActive = !t.active;
          const audio = audioRefs.current[id];
          if (audio) {
            if (nextActive) {
              audio.volume = t.volume;
              audio.play().catch((err) => console.error("Audio playback error:", err));
            } else {
              audio.pause();
            }
          }
          return { ...t, active: nextActive };
        }
        return t;
      })
    );
  };

  const handleVolumeChange = (id: SoundType, newVol: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, volume: newVol } : t))
    );
    const audio = audioRefs.current[id];
    if (audio) {
      audio.volume = newVol;
    }
  };

  const stopAll = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.pause();
    });
    setTracks((prev) => prev.map((t) => ({ ...t, active: false })));
  };

  const isAnyActive = tracks.some((t) => t.active);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600 dark:text-sage-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Klangwelten & Ambient</h3>
            <p className="text-xs text-foreground/60">Echte Naturaufnahmen zur Entspannung</p>
          </div>
        </div>

        {isAnyActive && (
          <button
            onClick={stopAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-200 transition-all cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" /> Alle Stopp
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
              track.active
                ? "bg-sage-50/70 dark:bg-sage-950/30 border-sage-500/60 shadow-xs"
                : "bg-background border-border/80 hover:border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center shrink-0">
                  {track.icon}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-foreground/90 truncate">{track.name}</span>
                  <span className="text-[11px] text-foreground/50 truncate">
                    {track.subtitle}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleTrack(track.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  track.active
                    ? "bg-sage-600 text-white shadow-xs"
                    : "bg-muted text-foreground/70 hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {track.active ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>

            {track.active && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 pt-1 border-t border-sage-200/50 dark:border-sage-900/50"
              >
                <VolumeX className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={track.volume}
                  onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-sage-600"
                />
                <Volume2 className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
