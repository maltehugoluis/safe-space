"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Settings, Check, AlertCircle, Loader, Bell, Link2 } from "lucide-react";

type SignalType = "ntfy" | "webhook";

export default function EmergencySignal() {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [signalType, setSignalType] = useState<SignalType>("ntfy");
  const [ntfyTopic, setNtfyTopic] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedType = localStorage.getItem("safespace_signal_type") as SignalType;
    const savedTopic = localStorage.getItem("safespace_ntfy_topic");
    const savedUrl = localStorage.getItem("safespace_webhook_url");

    if (savedType) setSignalType(savedType);
    if (savedTopic) setNtfyTopic(savedTopic);
    if (savedUrl) setWebhookUrl(savedUrl);
  }, []);

  // Save configuration to localStorage
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("safespace_signal_type", signalType);
    localStorage.setItem("safespace_ntfy_topic", ntfyTopic.trim());
    localStorage.setItem("safespace_webhook_url", webhookUrl.trim());
    setShowSettings(false);
  };

  // Manage press progress
  useEffect(() => {
    if (isHolding && status === "idle") {
      const step = 2.5; // Update speed (approx 1 second to fill: 1000ms / 40ms = 25 steps, 100 / 25 = 4)
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current!);
            triggerSignal();
            return 100;
          }
          return prev + step;
        });
      }, 40);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Decay progress quickly when let go
      if (progress > 0 && status === "idle") {
        const decayInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev <= 0) {
              clearInterval(decayInterval);
              return 0;
            }
            return prev - 8;
          });
        }, 30);
        return () => clearInterval(decayInterval);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHolding, status, progress]);

  const triggerSignal = async () => {
    setIsHolding(false);
    setStatus("sending");

    // Demo Mode check
    const isNtfyConfigured = signalType === "ntfy" && ntfyTopic.trim().length > 0;
    const isWebhookConfigured = signalType === "webhook" && webhookUrl.trim().length > 0;

    if (!isNtfyConfigured && !isWebhookConfigured) {
      // Simulate success if not configured (Demo Mode)
      setTimeout(() => {
        setStatus("success");
        setSuccessMessage("Signal ausgelöst (Demo-Modus, richte die Verbindung in den Einstellungen ein!)");
        setTimeout(() => {
          setStatus("idle");
          setProgress(0);
        }, 5000);
      }, 1500);
      return;
    }

    try {
      // Call our internal backend API to bypass CORS preflight issues
      const res = await fetch("/api/send-signal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: signalType,
          topic: ntfyTopic,
          url: webhookUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Signal transmission failed");
      }

      setStatus("success");
      setSuccessMessage(
        signalType === "ntfy"
          ? "Dein ntfy-Signal wurde erfolgreich gesendet."
          : "Dein Webhook-Signal wurde erfolgreich gesendet."
      );

      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 5000);
    } catch (err) {
      console.error("Signal fetch error:", err);
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 5000);
    }
  };

  // Start hold triggers
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setIsHolding(true);
  };

  // End hold triggers
  const handlePressEnd = () => {
    setIsHolding(false);
  };

  return (
    <div className="w-full bg-card/60 backdrop-blur-xl border border-border/60 rounded-[2rem] p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
      {/* Decorative background glow for the whole card */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-sage-400/10 dark:bg-sage-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sage-300/10 dark:bg-sage-400/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Settings trigger */}
      <div className="w-full flex justify-end mb-2 relative z-10">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2.5 rounded-full border border-border/80 bg-background/50 backdrop-blur-sm text-foreground/60 hover:text-foreground hover:bg-sage-50 dark:hover:bg-sage-950/50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Verbindung einrichten"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showSettings ? (
          <motion.div
            key="signal-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center w-full relative z-10 mt-2"
          >
            {/* The main hold button */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-8">
              
              {/* Idle Pulsing Ripples */}
              <AnimatePresence>
                {status === "idle" && !isHolding && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0, 0.4, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-sage-400/20 dark:bg-sage-300/10 pointer-events-none"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.7, 1], opacity: [0, 0.2, 0] }}
                      transition={{ duration: 3.5, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-sage-400/10 dark:bg-sage-300/5 pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Progress visual filling ring wrapper */}
              <div className="absolute inset-2">
                <svg className="w-full h-full -rotate-90 drop-shadow-md">
                  <circle
                    cx="104"
                    cy="104"
                    r="100"
                    className="stroke-sage-500/80 dark:stroke-sage-400/80 fill-none transition-all duration-75"
                    strokeWidth="6"
                    strokeDasharray="628"
                    strokeDashoffset={628 - (628 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Central button body */}
              <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer overflow-hidden ${
                  status === "sending"
                    ? "bg-beige-100 border border-beige-300 dark:bg-beige-950/60 dark:border-beige-800 shadow-[0_0_40px_rgba(var(--color-beige-400),0.3)]"
                    : status === "success"
                    ? "bg-sage-600 text-white shadow-[0_0_50px_rgba(var(--color-sage-500),0.6)]"
                    : status === "error"
                    ? "bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
                    : isHolding
                    ? "bg-sage-50 border border-sage-300 dark:bg-sage-900/60 dark:border-sage-800 scale-95 shadow-[0_0_60px_rgba(var(--color-sage-400),0.4)]"
                    : "bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 hover:shadow-xl hover:border-sage-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                }`}
                style={{ touchAction: "none" }}
              >
                {/* Internal gradient glow when holding */}
                {isHolding && status === "idle" && (
                  <div className="absolute inset-0 bg-gradient-to-b from-sage-400/20 to-transparent opacity-50 animate-pulse pointer-events-none" />
                )}

                {status === "idle" && (
                  <>
                    <Heart
                      className={`w-14 h-14 mb-2 transition-all duration-300 ${
                        isHolding 
                          ? "text-sage-600 dark:text-sage-400 scale-[1.15] fill-sage-600 dark:fill-sage-400 drop-shadow-md" 
                          : "text-sage-500 dark:text-sage-400 drop-shadow-sm"
                      }`}
                    />
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold text-center px-4 transition-colors ${
                      isHolding ? "text-sage-700 dark:text-sage-300" : "text-foreground/50"
                    }`}>
                      {isHolding ? "Gedrückt halten..." : "Halten für Signal"}
                    </span>
                  </>
                )}

                {status === "sending" && (
                  <>
                    <Loader className="w-12 h-12 animate-spin text-beige-600 dark:text-beige-400 mb-2 drop-shadow-sm" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-foreground/60">Senden...</span>
                  </>
                )}

                {status === "success" && (
                  <>
                    <Check className="w-14 h-14 stroke-[2.5] mb-2 drop-shadow-md" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">Gesendet</span>
                  </>
                )}

                {status === "error" && (
                  <>
                    <AlertCircle className="w-14 h-14 mb-2 drop-shadow-md" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">Fehler</span>
                  </>
                )}
              </button>
            </div>

            {/* Instruction description below */}
            <div className="min-h-[4rem] text-center max-w-sm px-4 flex flex-col justify-center items-center">
              <AnimatePresence mode="wait">
                {status === "idle" && (
                  <motion.p
                    key="idle-text"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[13px] text-foreground/60 leading-relaxed font-medium"
                  >
                    Halte das Herz gedrückt, um eine stille Benachrichtigung an deine Vertrauensperson zu senden.
                    {signalType === "ntfy" && ntfyTopic.trim() && (
                      <span className="block mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-sage-50 dark:bg-sage-950/50 rounded-full text-[10px] text-sage-600 dark:text-sage-400 font-bold tracking-wide">
                        <Bell className="w-3 h-3" />
                        ntfy: {ntfyTopic}
                      </span>
                    )}
                  </motion.p>
                )}
                {status === "success" && (
                  <motion.p
                    key="success-text"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[13px] text-sage-600 dark:text-sage-400 font-bold leading-relaxed"
                  >
                    {successMessage}
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p
                    key="error-text"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[13px] text-red-500 font-bold leading-relaxed"
                  >
                    Senden fehlgeschlagen. Prüfe deine Verbindung.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="signal-settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onSubmit={handleSaveSettings}
            className="w-full flex flex-col gap-4 text-left"
          >
            <h3 className="text-sm font-semibold tracking-wide">Signal-Einstellungen</h3>

            {/* Selector Tab for Connection Type */}
            <div className="flex bg-background border border-border p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setSignalType("ntfy")}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  signalType === "ntfy"
                    ? "bg-sage-600 text-white shadow-sm"
                    : "text-foreground/60 hover:bg-sage-50 dark:hover:bg-sage-950/30"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                ntfy.sh (Empfohlen)
              </button>
              <button
                type="button"
                onClick={() => setSignalType("webhook")}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  signalType === "webhook"
                    ? "bg-sage-600 text-white shadow-sm"
                    : "text-foreground/60 hover:bg-sage-50 dark:hover:bg-sage-950/30"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                Webhook URL
              </button>
            </div>

            {/* ntfy Form */}
            {signalType === "ntfy" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ntfyTopic" className="text-xs font-semibold text-foreground/60">
                    ntfy-Thema (Topic Name)
                  </label>
                  <input
                    id="ntfyTopic"
                    type="text"
                    value={ntfyTopic}
                    onChange={(e) => setNtfyTopic(e.target.value)}
                    placeholder="z.B. safe-space-alarm-123xyz"
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                  />
                </div>
                
                {/* Visual Step-by-Step Instructions */}
                <div className="p-3 bg-sage-50/50 dark:bg-sage-950/20 border border-sage-100 dark:border-sage-900 rounded-2xl flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-sage-800 dark:text-sage-300">Anleitung für dein Handy:</span>
                  <ol className="text-[9px] text-foreground/60 list-decimal pl-4 space-y-1.5 leading-relaxed">
                    <li>Lade die kostenlose <b>ntfy</b> App (iOS / Android) herunter.</li>
                    <li>Klicke auf das <b>+</b> und abonniere dein oben ausgedachtes Thema.</li>
                    <li>Trage genau denselben Namen hier oben ein und klicke auf Speichern.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Webhook Form */}
            {signalType === "webhook" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="webhookUrl" className="text-xs font-semibold text-foreground/60">
                    Discord oder Telegram Webhook URL
                  </label>
                  <input
                    id="webhookUrl"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full text-xs p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                  />
                </div>
                <p className="text-[9px] text-foreground/50 leading-relaxed">
                  Trage hier einen Discord Webhook oder Telegram Bot-Link ein. Wenn das Feld leer ist, läuft das Signal im sicheren Demo-Modus.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 rounded-xl border border-border bg-background text-xs font-medium hover:bg-sage-50 dark:hover:bg-sage-950 transition-all cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 transition-all shadow-sm cursor-pointer"
              >
                Speichern
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
