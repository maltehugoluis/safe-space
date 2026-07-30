"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Trash2, Edit2, Check, X, Loader } from "lucide-react";

type SoothingCard = {
  id: string;
  trigger: string;
  title: string;
  preview: string;
  content: string;
};

export default function SupporterLetters({ linkedEmail }: { linkedEmail: string }) {
  const [cards, setCards] = useState<SoothingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<SoothingCard | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [trigger, setTrigger] = useState("");
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [linkedEmail]);

  const fetchCards = async () => {
    if (!supabase || !linkedEmail) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("soothing_cards")
        .select("*")
        .eq("author_id", session.user.id)
        .eq("receiver_email", linkedEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingCard(null);
    setTrigger("");
    setTitle("");
    setPreview("");
    setContent("");
    setIsEditing(true);
  };

  const handleOpenEdit = (card: SoothingCard) => {
    setEditingCard(card);
    setTrigger(card.trigger);
    setTitle(card.title);
    setPreview(card.preview);
    setContent(card.content);
    setIsEditing(true);
  };

  const handleDeleteConfirm = async () => {
    if (!supabase || !deletingId) return;
    try {
      await supabase.from("soothing_cards").delete().eq("id", deletingId);
      setCards(cards.filter(c => c.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !linkedEmail) return;
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const cardData = {
        author_id: session.user.id,
        receiver_email: linkedEmail,
        trigger,
        title,
        preview,
        content,
      };

      if (editingCard) {
        // Update
        const { data, error } = await supabase
          .from("soothing_cards")
          .update(cardData)
          .eq("id", editingCard.id)
          .select()
          .single();
          
        if (error) throw error;
        setCards(cards.map(c => c.id === editingCard.id ? data : c));
      } else {
        // Insert
        const { data, error } = await supabase
          .from("soothing_cards")
          .insert([cardData])
          .select()
          .single();
          
        if (error) throw error;
        setCards([data, ...cards]);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving card:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!linkedEmail) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-4 text-foreground/60">
        <Sparkles className="w-8 h-8 opacity-50" />
        <p className="text-sm">Bitte trage zuerst die E-Mail-Adresse in den Einstellungen ein, um Briefe zu schreiben.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold font-serif flex items-center gap-2 text-foreground/90">
            <Sparkles className="w-5 h-5 text-sage-500" />
            Lies das, wenn... Briefe
          </h2>
          <p className="text-xs text-foreground/50">
            Schreibe kleine Aufmunterungen, die sie in der App lesen kann.
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleOpenNew}
            className="w-10 h-10 rounded-full bg-sage-600 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm"
          >
            <h3 className="text-sm font-bold flex items-center justify-between border-b border-border pb-3">
              {editingCard ? "Brief bearbeiten" : "Neuen Brief verfassen"}
              <button onClick={() => setIsEditing(false)} className="text-foreground/50 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/60">Trigger (Wann soll sie das lesen?)</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. du dich wertlos fühlst"
                  value={trigger}
                  onChange={e => setTrigger(e.target.value)}
                  className="text-sm p-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-sage-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/60">Überschrift</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Lies das, wenn Zweifel kommen."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="text-sm p-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-sage-500 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/60">Kurze Vorschau (1-2 Sätze)</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Du bist so viel mehr als deine Gedanken..."
                  value={preview}
                  onChange={e => setPreview(e.target.value)}
                  className="text-sm p-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-sage-500 outline-none italic"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/60">Der eigentliche Brief</label>
                <textarea
                  required
                  placeholder="Dein Text..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="text-sm p-4 rounded-xl border border-border bg-background focus:ring-1 focus:ring-sage-500 outline-none min-h-[200px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 bg-foreground text-background py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Speichern
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-sage-500" /></div>
            ) : cards.length === 0 ? (
              <div className="text-center p-8 bg-card border border-dashed border-border rounded-3xl">
                <p className="text-sm text-foreground/50">Du hast noch keine Briefe geschrieben.</p>
              </div>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-2 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                      Lies das, wenn...
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(card)} className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-background transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(card.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold pr-16">{card.title}</h3>
                  <p className="text-xs text-foreground/50 line-clamp-1 italic">{card.preview}</p>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-2 text-rose-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Brief löschen?</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Bist du sicher, dass du diesen Brief löschen möchtest? Er wird sofort bei deiner Freundin entfernt und kann nicht wiederhergestellt werden.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-muted text-foreground/70 hover:bg-muted/80 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-colors"
                >
                  Löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
