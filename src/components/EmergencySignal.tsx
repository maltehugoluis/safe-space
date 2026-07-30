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
      if (signalType === "ntfy") {
        // Trigger ntfy.sh push notification (100% Free)
        const topic = ntfyTopic.trim();
        const res = await fetch(`https://ntfy.sh/${topic}`, {
          method: "POST",
          body: "Ich brauche dich gerade. Bitte melde dich bei mir oder komm vorbei. Ich finde keine Worte.",
          headers: {
            "Title": "Safe Space Signal ❤️",
            "Priority": "5", // Max priority (vibrates & makes loud sound on phone)
            "Tags": "heart,rotating_light",
          },
        });

        if (!res.ok) throw new Error("ntfy response not ok");

        setStatus("success");
        setSuccessMessage("Dein ntfy-Signal wurde erfolgreich gesendet.");
      } else {
        // Trigger Discord/Telegram webhook
        const url = webhookUrl.trim();
        let bodyData = {};
        
        if (url.includes("discord.com/api/webhooks")) {
          bodyData = {
            content: "❤️ **Signal aus deinem Safe Space:**\nIch brauche dich gerade. Bitte melde dich bei mir oder komm zu mir. Ich finde gerade keine Worte.",
          };
        } else if (url.includes("api.telegram.org")) {
          bodyData = {
            text: "❤️ Signal aus deinem Safe Space: Ich brauche dich gerade. Bitte melde dich bei mir.",
          };
        } else {
          bodyData = {
            event: "safe_space_signal",
            message: "Ich brauche dich gerade. Bitte melde dich bei mir.",
            timestamp: new Date().toISOString(),
          };
        }

        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
          mode: "no-cors",
        });

        setStatus("success");
        setSuccessMessage("Dein Webhook-Signal wurde lautlos gesendet.");
      }

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
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-center">
      {/* Settings trigger */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full border border-border bg-background text-foreground/75 hover:bg-sage-50 dark:hover:bg-sage-950 transition-all cursor-pointer"
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
            className="flex flex-col items-center w-full"
          >
            {/* The main hold button */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-border" />

              {/* Progress visual filling ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  className="stroke-sage-500 dark:stroke-sage-400 fill-none transition-all"
                  strokeWidth="6"
                  strokeDasharray="578"
                  strokeDashoffset={578 - (578 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>

              {/* Central button body */}
              <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all select-none shadow-md cursor-pointer ${
                  status === "sending"
                    ? "bg-beige-100 border border-beige-300 dark:bg-beige-950/40 dark:border-beige-800"
                    : status === "success"
                    ? "bg-sage-600 text-white"
                    : status === "error"
                    ? "bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-500"
                    : isHolding
                    ? "bg-sage-100 border border-sage-300 dark:bg-sage-900/60 dark:border-sage-800 scale-95"
                    : "bg-background border border-border hover:border-sage-200"
                }`}
                style={{ touchAction: "none" }}
              >
                {status === "idle" && (
                  <>
                    <Heart
                      className={`w-12 h-12 mb-1.5 transition-all ${
                        isHolding 
                          ? "text-sage-600 dark:text-sage-400 scale-110 fill-current animate-pulse" 
                          : "text-sage-500 dark:text-sage-400"
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold text-center px-4 leading-tight">
                      {isHolding ? "Gedrückt halten..." : "Halten für Signal"}
                    </span>
                  </>
                )}

                {status === "sending" && (
                  <>
                    <Loader className="w-10 h-10 animate-spin text-sage-600 dark:text-sage-400 mb-1" />
                    <span className="text-xs font-medium text-foreground/70">Wird gesendet...</span>
                  </>
                )}

                {status === "success" && (
                  <>
                    <Check className="w-12 h-12 stroke-[3] mb-1.5" />
                    <span className="text-xs font-semibold">Gesendet</span>
                  </>
                )}

                {status === "error" && (
                  <>
                    <AlertCircle className="w-12 h-12 mb-1.5" />
                    <span className="text-xs font-semibold">Fehler</span>
                  </>
                )}
              </button>
            </div>

            {/* Instruction description below */}
            <div className="h-12 text-center max-w-xs px-2 flex flex-col justify-center">
              {status === "idle" && (
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Halte das Herz gedrückt, um eine stille Benachrichtigung an deine Vertrauensperson zu senden.
                  {signalType === "ntfy" && ntfyTopic.trim() && (
                    <span className="block text-[10px] text-sage-600 dark:text-sage-400 font-semibold mt-1">
                      Aktiviert über ntfy: "{ntfyTopic}"
                    </span>
                  )}
                </p>
              )}
              {status === "success" && (
                <p className="text-xs text-sage-600 dark:text-sage-400 font-medium leading-relaxed">
                  {successMessage}
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-red-500 font-medium leading-relaxed">
                  Senden fehlgeschlagen. Prüfe deine Internetverbindung oder den Webhook.
                </p>
              )}
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
