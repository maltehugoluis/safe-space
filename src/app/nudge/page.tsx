"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, Check, Loader, Home } from "lucide-react";
import Link from "next/link";

export default function NudgePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setIsReady(true);
    });
  }, []);

  const handleSendNudge = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ has_unread_nudge: true })
        .eq("id", session.user.id);

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error sending nudge:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader className="w-8 h-8 animate-spin text-sage-500" />
        <p className="text-sm font-bold">Bitte warte kurz...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center shadow-inner">
        <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-2xl font-bold font-serif">Ich denk an dich</h1>
        <p className="text-sm text-foreground/60 leading-relaxed">
          Klicke auf den Button, um ihr eine kleine, unsichtbare Nachricht zu schicken. Beim nächsten Öffnen der App regnen Herzen über ihren Bildschirm.
        </p>
      </div>

      <button
        onClick={handleSendNudge}
        disabled={loading || success}
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
            <Heart className="w-5 h-5 fill-white" /> Senden
          </>
        )}
      </button>

      <Link href="/" className="mt-8 text-xs font-bold text-foreground/40 hover:text-foreground/80 flex items-center gap-1.5 transition-colors">
        <Home className="w-4 h-4" /> Zurück zur Haupt-App
      </Link>
    </div>
  );
}
