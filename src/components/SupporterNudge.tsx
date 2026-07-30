"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, Check, Loader } from "lucide-react";

export default function SupporterNudge({ linkedEmail }: { linkedEmail: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendNudge = async () => {
    if (!supabase || !linkedEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("send_nudge", { target_email: linkedEmail });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error sending nudge:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center shadow-inner">
        <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-2xl font-bold font-serif">Ich denk an dich</h1>
        <p className="text-sm text-foreground/60 leading-relaxed">
          Klicke auf den Button, um <span className="font-bold text-foreground">{linkedEmail}</span> eine unsichtbare Nachricht zu schicken. Beim nächsten Öffnen der App regnen Herzen über den Bildschirm.
        </p>
      </div>

      <button
        onClick={handleSendNudge}
        disabled={loading || success || !linkedEmail}
        className={`w-full max-w-xs py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
          success
            ? "bg-sage-600 text-white"
            : "bg-rose-500 text-white hover:scale-105 active:scale-95"
        }`}
      >
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : success ? (
          <>
            <Check className="w-5 h-5" /> Nudge gesendet!
          </>
        ) : (
          <>
            <Heart className="w-5 h-5 fill-white" /> Jetzt Senden
          </>
        )}
      </button>

      {!linkedEmail && (
        <p className="text-xs text-red-500 font-semibold mt-4">
          Bitte trage zuerst die E-Mail der Person in den Einstellungen ein.
        </p>
      )}
    </div>
  );
}
