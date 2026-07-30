"use client";

import React, { useState, useEffect } from "react";
import { Smile, CheckSquare, Plus, Trash2, Heart, Lock, Check } from "lucide-react";

type MoodLog = {
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
  timestamp: string;
  text: string;
  shared: boolean;
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

  // Sync with LocalStorage on mount
  useEffect(() => {
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
  }, []);

  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Add Mood
  const handleMoodSelect = (moodLabel: string, emoji: string) => {
    const newLog: MoodLog = {
      timestamp: new Date().toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      mood: moodLabel,
      emoji: emoji,
    };
    const updated = [newLog, ...moodLogs].slice(0, 5); // Keep last 5 logs
    setMoodLogs(updated);
    saveToLocal("safespace_mood_logs", updated);
    setSelectedMood(moodLabel);

    // Reset indicator after a bit
    setTimeout(() => setSelectedMood(null), 2000);
  };

  // Add Journal Entry
  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    const newEntry: JournalEntry = {
      timestamp: new Date().toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      text: journalText,
      shared: shareJournal,
    };

    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    saveToLocal("safespace_journal_entries", updated);
    setJournalText("");
    setShareJournal(false);
  };

  // Delete Journal Entry
  const handleDeleteJournal = (idx: number) => {
    const updated = journalEntries.filter((_, i) => i !== idx);
    setJournalEntries(updated);
    saveToLocal("safespace_journal_entries", updated);
  };

  // Checkbox Achievement Toggle
  const handleToggleAchievement = (id: string) => {
    const updated = achievements.map((ach) =>
      ach.id === id ? { ...ach, checked: !ach.checked } : ach
    );
    setAchievements(updated);
    saveToLocal("safespace_achievements", updated);
  };

  // Add Custom Achievement
  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchievementText.trim()) return;

    const newAch: Achievement = {
      id: Date.now().toString(),
      text: newAchievementText.trim(),
      checked: false,
    };

    const updated = [...achievements, newAch];
    setAchievements(updated);
    saveToLocal("safespace_achievements", updated);
    setNewAchievementText("");
  };

  // Reset Achievements
  const handleResetAchievements = () => {
    const updated = achievements.map(ach => ({ ...ach, checked: false }));
    setAchievements(updated);
    saveToLocal("safespace_achievements", updated);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Privacy Notice */}
      <div className="w-full p-3 rounded-xl border border-sage-200 bg-sage-50/50 dark:border-sage-800 dark:bg-sage-950/20 flex items-center justify-center gap-1.5 text-[11px] text-sage-700 dark:text-sage-400">
        <Lock className="w-3.5 h-3.5" />
        <span>Alle Einträge werden privat & lokal auf deinem Gerät gespeichert</span>
      </div>

      {/* Druckfreier Mood Tracker */}
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

      {/* Micro-Erfolge */}
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

      {/* Gedankendump */}
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
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-background flex flex-col gap-1.5 text-left relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-foreground/50 font-semibold">{entry.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      {entry.shared && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 dark:bg-sage-950/60 dark:text-sage-400 font-bold border border-sage-200 dark:border-sage-900">
                          Teilen-Aktiv
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteJournal(idx)}
                        className="p-1 rounded text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
