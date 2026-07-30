"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Loader, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type JournalEntry = {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
};

export default function SharedThoughts({ linkedEmail }: { linkedEmail: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "approved" | "pending" | "none" | "error">("loading");

  useEffect(() => {
    checkStatusAndFetch();
  }, [linkedEmail]);

  const checkStatusAndFetch = async () => {
    if (!supabase || !linkedEmail) return;
    setLoading(true);
    setConnectionStatus("loading");
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error("No session");

      const { data: status, error: statusError } = await supabase.rpc("check_connection_status", {
        target_email: linkedEmail,
        requester_email: session.user.email
      });

      if (statusError) throw statusError;

      setConnectionStatus(status as any);

      if (status === "approved") {
        await fetchSharedThoughts();
      }
    } catch (err) {
      console.error(err);
      setConnectionStatus("error");
      setError("Verbindungsstatus konnte nicht geprüft werden.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedThoughts = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      // Wir holen alle Einträge, die shared = true sind.
      // Da wir in einer privaten App sind, sind das die Gedanken der verlinkten Person.
      const { data, error: fetchError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("shared", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        setEntries(data as JournalEntry[]);
      }
    } catch (err: any) {
      console.error("Error fetching shared thoughts:", err);
      setError("Die Gedanken konnten nicht geladen werden.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="w-10 h-10 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600 dark:text-sage-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-foreground">Geteilte Gedanken</h2>
          <p className="text-xs text-foreground/60">
            Hier siehst du alle Gedanken-Dumps, die mit dir geteilt wurden.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-sage-500" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-500 text-sm font-bold">
          {error}
        </div>
      ) : connectionStatus === "pending" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center bg-card rounded-3xl border border-border">
          <Loader className="w-8 h-8 text-sage-500 animate-spin" />
          <p className="text-sm font-bold text-foreground/80">Warte auf Bestätigung...</p>
          <p className="text-xs text-foreground/60">
            Die unterstützte Person muss deine Anfrage in ihren Einstellungen erst annehmen, bevor du die Gedanken sehen kannst.
          </p>
        </div>
      ) : connectionStatus !== "approved" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center bg-card rounded-3xl border border-border text-foreground/50">
          <Heart className="w-8 h-8" />
          <p className="text-sm font-bold">Nicht verbunden</p>
          <p className="text-xs">Aktiviere eine Verbindung in den Einstellungen.</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center bg-card rounded-3xl border border-border">
          <Heart className="w-8 h-8 text-foreground/20" />
          <p className="text-sm font-bold text-foreground/50">
            Noch keine geteilten Gedanken
          </p>
          <p className="text-xs text-foreground/40">
            Wenn die unterstützte Person beim Journaling "Möchte ich mit dir teilen" ankreuzt, erscheinen die Einträge hier.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border p-5 rounded-3xl shadow-sm relative overflow-hidden"
              >
                {/* Decorative small accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-sage-300 dark:bg-sage-600" />
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs text-foreground/50 font-bold border-b border-border/50 pb-2">
                    <span>Gedankendump</span>
                    <span>
                      {new Date(entry.created_at).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {entry.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
