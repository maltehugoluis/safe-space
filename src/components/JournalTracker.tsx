"use client";

import React, { useState, useEffect } from "react";
import { Smile, CheckSquare, Plus, Trash2, Heart, Lock, Check, LogIn, LogOut, Loader, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type MoodLog = {
  id?: string;
  timestamp: string;
  mood: string;
  emoji: string;
};

type Achievement = {
  id: string;
  text: string;
  checked: boolean;
};

type JournalEntry = {
  id?: string;
  timestamp: string;
  text: string;
  shared: boolean;
  user_id?: string;
};

const DEFAULT_ACHIEVEMENTS = [
  { id: "1", text: "Aus dem Bett aufgestanden", checked: false },
  { id: "2", text: "Ein Glas Wasser getrunken", checked: false },
  { id: "3", text: "Tief durchgeatmet", checked: false },
  { id: "4", text: "Etwas gegessen", checked: false },
];

const MOODS = [
  { label: "Schwer", emoji: "🌧️", color: "bg-blue-100 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900" },
  { label: "Trüb", emoji: "☁️", color: "bg-slate-100 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800" },
  { label: "Ganz okay", emoji: "⛅", color: "bg-beige-100 border-beige-200 dark:bg-beige-950/30 dark:border-beige-900" },
  { label: "Gut", emoji: "☀️", color: "bg-sage-100 border-sage-200 dark:bg-sage-950/30 dark:border-sage-900" },
  { label: "Geborgen", emoji: "✨", color: "bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900" },
];

export default function JournalTracker() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);

  // Mood Tracker State
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Journal State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalText, setJournalText] = useState("");
  const [shareJournal, setShareJournal] = useState(false);

  // Micro-Achievements State
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievementText, setNewAchievementText] = useState("");

  // Loading States
  const [dataLoading, setDataLoading] = useState(false);

  // 1. Auth Listener & Initial Load
  useEffect(() => {
    // Check active session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    }) ?? { data: { subscription: null } };

    // Initial localStorage load
    loadLocalData();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch Data from Supabase when user changes
  useEffect(() => {
    if (user) {
      fetchSupabaseData();
    } else {
      loadLocalData();
    }
  }, [user]);

  // Load from local storage fallback
  const loadLocalData = () => {
    const savedMoods = localStorage.getItem("safespace_mood_logs");
    if (savedMoods) setMoodLogs(JSON.parse(savedMoods));

    const savedJournal = localStorage.getItem("safespace_journal_entries");
    if (savedJournal) setJournalEntries(JSON.parse(savedJournal));

    const savedAchievements = localStorage.getItem("safespace_achievements");
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      setAchievements(DEFAULT_ACHIEVEMENTS);
    }
  };

  // Fetch from Supabase database
  const fetchSupabaseData = async () => {
    if (!supabase || !user) return;
    setDataLoading(true);

    try {
      // 1. Fetch Mood Logs
      const { data: moods, error: moodsErr } = await supabase
        .from("mood_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!moodsErr && moods) {
        setMoodLogs(
          moods.map((m) => ({
            id: m.id,
            mood: m.mood,
            emoji: m.emoji,
            timestamp: new Date(m.created_at).toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" }),
          }))
        );
      }

      // 2. Fetch Journal Entries (both own, and shared ones from others thanks to RLS!)
      const { data: journal, error: journalErr } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!journalErr && journal) {
        setJournalEntries(
          journal.map((j) => ({
            id: j.id,
            text: j.text,
            shared: j.shared,
            user_id: j.user_id,
            timestamp: new Date(j.created_at).toLocaleString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );
      }

      // 3. Fetch Achievements
      const { data: achs, error: achsErr } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: true });

      if (!achsErr && achs && achs.length > 0) {
        setAchievements(
          achs.map((a) => ({
            id: a.id,
            text: a.text,
            checked: a.checked,
          }))
        );
      } else {
        // Fallback to local default achievements if database is empty
        const savedAchievements = localStorage.getItem("safespace_achievements");
        setAchievements(savedAchievements ? JSON.parse(savedAchievements) : DEFAULT_ACHIEVEMENTS);
      }
    } catch (err) {
      console.error("Error fetching database data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Auth Handler: Login / Register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setAuthError("Konto erstellt! Bitte überprüfe deine E-Mails für den Bestätigungslink.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Success: Trigger sync of local records
        if (data.user) {
          await syncLocalToSupabase(data.user.id);
          setShowAuthForm(false);
          setEmail("");
          setPassword("");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentifizierungsfehler.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    loadLocalData();
  };

  // Sync existing local storage records into database on login
  const syncLocalToSupabase = async (userId: string) => {
    if (!supabase) return;

    try {
      // 1. Sync local mood logs
      const localMoods = localStorage.getItem("safespace_mood_logs");
      if (localMoods) {
        const moods: MoodLog[] = JSON.parse(localMoods);
        // Insert them into database
        const rows = moods.map((m) => ({
          user_id: userId,
          mood: m.mood,
          emoji: m.emoji,
        }));
        await supabase.from("mood_logs").insert(rows);
      }

      // 2. Sync local journal entries
      const localJournal = localStorage.getItem("safespace_journal_entries");
      if (localJournal) {
        const entries: JournalEntry[] = JSON.parse(localJournal);
        const rows = entries.map((j) => ({
          user_id: userId,
          text: j.text,
          shared: j.shared,
        }));
        await supabase.from("journal_entries").insert(rows);
      }

      // 3. Sync local achievements
      const localAchs = localStorage.getItem("safespace_achievements");
      const achsToSync: Achievement[] = localAchs ? JSON.parse(localAchs) : DEFAULT_ACHIEVEMENTS;
      const rows = achsToSync.map((a) => ({
        id: a.id,
        user_id: userId,
        text: a.text,
        checked: a.checked,
      }));
      await supabase.from("achievements").upsert(rows);

      // Clear local storage sync flags (keep cached)
      console.log("Local storage synchronized with Supabase database.");
    } catch (err) {
      console.error("Failed to sync local data:", err);
    }
  };

  // Handle Mood Select
  const handleMoodSelect = async (moodLabel: string, emoji: string) => {
    const newLog: MoodLog = {
      timestamp: new Date().toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      mood: moodLabel,
      emoji: emoji,
    };

    // Save locally
    const updatedLocal = [newLog, ...moodLogs].slice(0, 5);
    setMoodLogs(updatedLocal);
    localStorage.setItem("safespace_mood_logs", JSON.stringify(updatedLocal));
    setSelectedMood(moodLabel);

    // Save to Supabase if logged in
    if (supabase && user) {
      try {
        await supabase.from("mood_logs").insert({
          user_id: user.id,
          mood: moodLabel,
          emoji: emoji,
        });
      } catch (err) {
        console.error("DB error saving mood log:", err);
      }
    }

    setTimeout(() => setSelectedMood(null), 2000);
  };

  // Add Journal Entry
  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    const newEntry: JournalEntry = {
      timestamp: new Date().toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      text: journalText,
      shared: shareJournal,
    };

    // Save locally
    const updatedLocal = [newEntry, ...journalEntries];
    setJournalEntries(updatedLocal);
    localStorage.setItem("safespace_journal_entries", JSON.stringify(updatedLocal));

    // Save to Supabase if logged in
    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            text: journalText,
            shared: shareJournal,
          })
          .select();

        if (!error && data) {
          // Re-fetch to fetch both updated own entries + potential partner entries
          fetchSupabaseData();
        }
      } catch (err) {
        console.error("DB error saving journal entry:", err);
      }
    }

    setJournalText("");
    setShareJournal(false);
  };

  // Delete Journal Entry
  const handleDeleteJournal = async (idx: number, id?: string) => {
    // Delete locally
    const updatedLocal = journalEntries.filter((_, i) => i !== idx);
    setJournalEntries(updatedLocal);
    localStorage.setItem("safespace_journal_entries", JSON.stringify(updatedLocal));

    // Delete in Supabase if logged in & ID exists
    if (supabase && user && id) {
      try {
        await supabase.from("journal_entries").delete().eq("id", id);
      } catch (err) {
        console.error("DB error deleting journal entry:", err);
      }
    }
  };

  // Toggle Achievement Checkbox
  const handleToggleAchievement = async (id: string) => {
    // Toggle locally
    const updatedLocal = achievements.map((ach) =>
      ach.id === id ? { ...ach, checked: !ach.checked } : ach
    );
    setAchievements(updatedLocal);
    localStorage.setItem("safespace_achievements", JSON.stringify(updatedLocal));

    // Update in Supabase if logged in
    const targetAch = updatedLocal.find((ach) => ach.id === id);
    if (supabase && user && targetAch) {
      try {
        await supabase.from("achievements").upsert({
          id: targetAch.id,
          user_id: user.id,
          text: targetAch.text,
          checked: targetAch.checked,
        });
      } catch (err) {
        console.error("DB error upserting achievement:", err);
      }
    }
  };

  // Add Custom Achievement
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievementText.trim()) return;

    const newAch: Achievement = {
      id: Date.now().toString(),
      text: newAchievementText.trim(),
      checked: false,
    };

    // Save locally
    const updatedLocal = [...achievements, newAch];
    setAchievements(updatedLocal);
    localStorage.setItem("safespace_achievements", JSON.stringify(updatedLocal));
    setNewAchievementText("");

    // Save to Supabase if logged in
    if (supabase && user) {
      try {
        await supabase.from("achievements").insert({
          id: newAch.id,
          user_id: user.id,
          text: newAch.text,
          checked: newAch.checked,
        });
      } catch (err) {
        console.error("DB error adding achievement:", err);
      }
    }
  };

  // Reset Achievements check status
  const handleResetAchievements = async () => {
    // Reset locally
    const updatedLocal = achievements.map(ach => ({ ...ach, checked: false }));
    setAchievements(updatedLocal);
    localStorage.setItem("safespace_achievements", JSON.stringify(updatedLocal));

    // Reset in Supabase if logged in
    if (supabase && user) {
      try {
        // Upsert all updated entries
        const rows = updatedLocal.map((a) => ({
          id: a.id,
          user_id: user.id,
          text: a.text,
          checked: false,
        }));
        await supabase.from("achievements").upsert(rows);
      } catch (err) {
        console.error("DB error resetting achievements:", err);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Cloud Sync Status Header & Login Trigger */}
      <div className="w-full p-4 rounded-3xl border border-border bg-card shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${user ? "bg-sage-500 animate-pulse" : "bg-beige-400"}`} />
            <span className="text-xs font-bold text-foreground/80">
              {user ? `Verbunden: ${user.email}` : "Lokal gesichert (Offline-Modus)"}
            </span>
          </div>

          <button
            onClick={() => (user ? handleSignOut() : setShowAuthForm(!showAuthForm))}
            className="text-[10px] font-bold border border-border px-3 py-1.5 rounded-full bg-background hover:bg-sage-50 dark:hover:bg-sage-950 transition-all flex items-center gap-1"
          >
            {user ? (
              <>
                <LogOut className="w-3 h-3" /> Abmelden
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3" /> Partner-Login
              </>
            )}
          </button>
        </div>

        {/* Sync loading status */}
        {dataLoading && (
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/50 italic">
            <Loader className="w-3.5 h-3.5 animate-spin" />
            <span>Synchronisiere mit Supabase...</span>
          </div>
        )}

        {/* Secure database notice */}
        {!user && !showAuthForm && (
          <p className="text-[10px] text-foreground/50 leading-relaxed">
            Deine Notizen werden sicher auf diesem Gerät aufbewahrt. Melde dich an, um geteilte Notizen mit deinem Partner live zu synchronisieren.
          </p>
        )}

        {/* Auth form toggle */}
        {showAuthForm && !user && (
          <form onSubmit={handleAuth} className="flex flex-col gap-3 border-t border-border pt-4 mt-1">
            <h3 className="text-xs font-bold tracking-wide">
              {isRegistering ? "Neuen Safe-Space erstellen" : "Mit Partner-Konto anmelden"}
            </h3>

            <div className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail-Adresse"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                className="w-full text-xs p-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
              />
            </div>

            {authError && (
              <p className="text-[10px] font-semibold text-red-500 bg-red-50/50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-100 dark:border-red-950/30">
                {authError}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={authLoading}
                className="flex-1 py-2.5 rounded-xl bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {authLoading ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : isRegistering ? (
                  "Konto erstellen"
                ) : (
                  "Anmelden"
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] text-foreground/60 hover:underline px-2 py-1 font-semibold"
              >
                {isRegistering ? "Bereits ein Konto? Login" : "Noch kein Konto? Registrieren"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mood Tracker Component */}
      <div className="flex flex-col gap-3 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-foreground/85 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-sage-500" /> Wie geht es dir gerade?
          </h2>
          <p className="text-xs text-foreground/50 leading-relaxed mt-0.5">
            Ganz ohne Statistiken oder Erfolgsdruck. Wähle einfach aus, was passt.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2 mt-2">
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => handleMoodSelect(m.label, m.emoji)}
              className={`py-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 hover:scale-105 active:scale-95 ${m.color}`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] font-semibold text-foreground/75 leading-none">{m.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <p className="text-xs text-center text-sage-600 dark:text-sage-400 font-semibold mt-2 animate-pulse">
            Gefühl vermerkt. Nimm dir Zeit... ❤️
          </p>
        )}
      </div>

      {/* Micro-Erfolge Component */}
      <div className="flex flex-col gap-3 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-bold text-foreground/85 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-beige-600 dark:text-beige-400" /> Deine Erfolge des Tages
            </h2>
            <p className="text-xs text-foreground/50 leading-relaxed mt-0.5">
              Jede Kleinigkeit ist heute ein Sieg. Du machst das super.
            </p>
          </div>
          <button
            onClick={handleResetAchievements}
            className="text-[10px] text-foreground/60 border border-border px-2.5 py-1 rounded-full hover:bg-sage-50 dark:hover:bg-sage-950 transition-all font-semibold"
          >
            Zurücksetzen
          </button>
        </div>

        {/* Checkbox list */}
        <div className="flex flex-col gap-2 mt-2">
          {achievements.map((ach) => (
            <button
              key={ach.id}
              onClick={() => handleToggleAchievement(ach.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                ach.checked
                  ? "bg-sage-100/30 border-sage-200 text-foreground/60 dark:bg-sage-950/20 dark:border-sage-900"
                  : "bg-background border-border text-foreground hover:border-sage-150"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  ach.checked
                    ? "bg-sage-600 border-sage-600 text-white"
                    : "border-border bg-background"
                }`}
              >
                {ach.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className={`text-xs ${ach.checked ? "line-through" : ""}`}>
                {ach.text}
              </span>
            </button>
          ))}
        </div>

        {/* Add custom success */}
        <form onSubmit={handleAddAchievement} className="flex gap-2 mt-2">
          <input
            type="text"
            value={newAchievementText}
            onChange={(e) => setNewAchievementText(e.target.value)}
            placeholder="z.B. Ein wenig gedehnt..."
            className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-sage-600 text-white hover:bg-sage-700 transition-all flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Gedankendump Component */}
      <div className="flex flex-col gap-3 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-foreground/85 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-sage-500" /> Gedankendump
          </h2>
          <p className="text-xs text-foreground/50 leading-relaxed mt-0.5">
            Schreibe einfach frei auf, was dich gerade beschäftigt.
          </p>
        </div>

        <form onSubmit={handleSaveJournal} className="flex flex-col gap-3 mt-1">
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            rows={4}
            placeholder="Schreib alles auf. Keine Zensur, kein richtig oder falsch..."
            className="w-full text-xs p-4 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500 resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shareJournal}
                onChange={(e) => setShareJournal(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 border-border focus:ring-sage-500"
              />
              <span className="text-[11px] text-foreground/60 font-medium">
                Möchte ich mit dir teilen
              </span>
            </label>

            <button
              type="submit"
              disabled={!journalText.trim()}
              className="px-6 py-2.5 rounded-full bg-sage-600 text-white text-xs font-semibold hover:bg-sage-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
            >
              Speichern
            </button>
          </div>
        </form>

        {/* Previous entries */}
        {journalEntries.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border pt-4 mt-2">
            <h3 className="text-xs font-bold text-foreground/70">Gespeicherte Notizen</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {journalEntries.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="p-3.5 rounded-xl border border-border bg-background flex flex-col gap-1.5 text-left relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-foreground/50 font-semibold">{entry.timestamp}</span>
                      {entry.user_id && user && entry.user_id !== user.id && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-beige-100 text-beige-800 dark:bg-beige-950/40 dark:text-beige-400 font-bold border border-beige-200 dark:border-beige-800 flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5" />
                          Partner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {entry.shared && (!entry.user_id || (user && entry.user_id === user.id)) && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 dark:bg-sage-950/60 dark:text-sage-400 font-bold border border-sage-200 dark:border-sage-900">
                          Teilen-Aktiv
                        </span>
                      )}
                      
                      {/* Delete button (only show for own entries!) */}
                      {(!entry.user_id || (user && entry.user_id === user.id)) && (
                        <button
                          onClick={() => handleDeleteJournal(idx, entry.id)}
                          className="p-1 rounded text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
