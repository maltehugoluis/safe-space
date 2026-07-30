"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, CloudRain, Waves, Flame, Radio, Play, Square } from "lucide-react";
import { motion } from "framer-motion";

type SoundType = "rain" | "waves" | "fire" | "brown";

interface SoundTrack {
  id: SoundType;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  volume: number;
}

export default function SoundscapeGenerator() {
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: "rain", name: "Sanfter Regen", icon: <CloudRain className="w-5 h-5 text-sage-600 dark:text-sage-400" />, active: false, volume: 0.5 },
    { id: "waves", name: "Meeresrauschen", icon: <Waves className="w-5 h-5 text-sage-600 dark:text-sage-400" />, active: false, volume: 0.5 },
    { id: "fire", name: "Lagerfeuer", icon: <Flame className="w-5 h-5 text-sage-600 dark:text-sage-400" />, active: false, volume: 0.5 },
    { id: "brown", name: "Tiefe Ruhe", icon: <Radio className="w-5 h-5 text-sage-600 dark:text-sage-400" />, active: false, volume: 0.5 },
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    [key in SoundType]?: {
      source: AudioNode;
      gain: GainNode;
      interval?: number;
    };
  }>({});

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Generate Noise Buffer
  const createNoiseBuffer = (ctx: AudioContext, type: "white" | "pink" | "brown") => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === "white") {
        output[i] = white;
      } else if (type === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      } else if (type === "brown") {
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }
    return buffer;
  };

  const startSound = (id: SoundType, initialVol: number) => {
    const ctx = getAudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(initialVol * 0.3, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (id === "rain") {
      const buffer = createNoiseBuffer(ctx, "pink");
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();

      nodesRef.current.rain = { source: noise, gain: gainNode };
    } else if (id === "waves") {
      const buffer = createNoiseBuffer(ctx, "pink");
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      // LFO for wave swelling
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      noise.connect(filter);
      filter.connect(gainNode);

      noise.start();
      lfo.start();

      nodesRef.current.waves = { source: noise, gain: gainNode };
    } else if (id === "fire") {
      const buffer = createNoiseBuffer(ctx, "pink");
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();

      // Fire Crackle Interval
      const intervalId = window.setInterval(() => {
        if (Math.random() > 0.4) {
          const popGain = ctx.createGain();
          popGain.gain.setValueAtTime((Math.random() * 0.15 + 0.05) * initialVol, ctx.currentTime);
          popGain.connect(ctx.destination);

          const popBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
          const data = popBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
          }

          const pop = ctx.createBufferSource();
          pop.buffer = popBuffer;
          pop.connect(popGain);
          pop.start();
        }
      }, 120);

      nodesRef.current.fire = { source: noise, gain: gainNode, interval: intervalId };
    } else if (id === "brown") {
      const buffer = createNoiseBuffer(ctx, "brown");
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();

      nodesRef.current.brown = { source: noise, gain: gainNode };
    }
  };

  const stopSound = (id: SoundType) => {
    const node = nodesRef.current[id];
    if (node) {
      if (node.interval) clearInterval(node.interval);
      try {
        (node.source as AudioBufferSourceNode).stop();
      } catch (e) {}
      node.gain.disconnect();
      delete nodesRef.current[id];
    }
  };

  const toggleTrack = (id: SoundType) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.active;
          if (nextState) {
            startSound(id, t.volume);
          } else {
            stopSound(id);
          }
          return { ...t, active: nextState };
        }
        return t;
      })
    );
  };

  const handleVolumeChange = (id: SoundType, newVol: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, volume: newVol } : t))
    );
    const node = nodesRef.current[id];
    if (node && audioCtxRef.current) {
      node.gain.gain.setValueAtTime(newVol * 0.3, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup all sound nodes on unmount
      Object.keys(nodesRef.current).forEach((key) => {
        stopSound(key as SoundType);
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const isAnyActive = tracks.some((t) => t.active);

  const stopAll = () => {
    tracks.forEach((t) => {
      if (t.active) stopSound(t.id);
    });
    setTracks((prev) => prev.map((t) => ({ ...t, active: false })));
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600 dark:text-sage-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Klangwelten & Ambient</h3>
            <p className="text-xs text-foreground/60">Mixe sanfte Naturgeräusche zur Beruhigung</p>
          </div>
        </div>

        {isAnyActive && (
          <button
            onClick={stopAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-200 transition-all"
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
                    {track.id === "rain" ? "Prasseln" : track.id === "waves" ? "Brandung" : track.id === "fire" ? "Knistern" : "Rauschen"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleTrack(track.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
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
