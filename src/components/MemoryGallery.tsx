"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Heart, X, Plus, Loader, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Memory = {
  id: string;
  title: string;
  note: string;
  image_url: string;
  date: string;
  created_at?: string;
};

// Fallback dummy memories just in case the database is completely empty
const DUMMY_MEMORIES: Memory[] = [
  {
    id: "lake",
    title: "Unser Spaziergang am See",
    note: "Hier war alles ganz ruhig. Wir haben einfach nur auf das glitzernde Wasser geschaut und die kühle Luft eingeatmet. Stell dir vor, wir stehen genau jetzt wieder dort.",
    image_url: "/images/soothing_sunset.jpg",
    date: "Herbst 2025",
  },
  {
    id: "forest",
    title: "Der friedliche Waldweg",
    note: "Der Geruch von nadeligem Kiefernholz, Moos und nasser Erde. Die Vögel haben leise gezwitschert. Ein Ort, an dem wir einfach tief durchatmen können.",
    image_url: "/images/forest_mist.jpg",
    date: "Frühling 2026",
  },
];

export default function MemoryGallery() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newDate, setNewDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch memories on mount
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error("Error fetching memories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newTitle || !newNote || !newDate) {
      setUploadError("Bitte fülle alle Felder aus und wähle ein Bild.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      if (!supabase) throw new Error("Supabase ist nicht konfiguriert.");
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error("Nicht eingeloggt");

      // 1. Upload image to Supabase Storage Bucket ('memories')
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error(`Fehler beim Bild-Upload: ${uploadError.message}`);
      }

      // 2. Get Public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('memories')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Insert into 'memories' table
      const newMemory = {
        user_id: user.id,
        title: newTitle.trim(),
        note: newNote.trim(),
        date: newDate.trim(),
        image_url: imageUrl
      };

      const { error: dbError } = await supabase
        .from("memories")
        .insert(newMemory);

      if (dbError) {
        throw new Error(`Fehler beim Speichern in der Datenbank: ${dbError.message}`);
      }

      // 4. Success cleanup & refresh
      setShowUploadModal(false);
      resetForm();
      fetchMemories();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Es ist ein unbekannter Fehler aufgetreten.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewTitle("");
    setNewNote("");
    setNewDate("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError("");
  };

  const displayMemories = memories.length > 0 ? memories : DUMMY_MEMORIES;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/85 flex items-center justify-between w-full">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-sage-500" />
            Erinnerungs-Galerie
          </span>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-sage-100 hover:bg-sage-200 text-sage-700 dark:bg-sage-900/60 dark:text-sage-300 dark:hover:bg-sage-800 py-1.5 px-3 rounded-full transition-all"
          >
            <Plus className="w-3 h-3" />
            Neu
          </button>
        </h2>
        <p className="text-xs text-foreground/60 leading-relaxed pr-8">
          Schöne gemeinsame Augenblicke und friedliche Orte, um dich in stürmischen Zeiten zu erden. Lade hier Momente hoch, die dir Kraft geben.
        </p>
      </div>

      {/* Grid of memory cards */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="w-6 h-6 text-sage-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {displayMemories.map((memory) => (
            <motion.button
              key={memory.id}
              onClick={() => setActiveMemory(memory)}
              className="text-left rounded-2xl border border-border bg-card overflow-hidden hover:border-sage-300 dark:hover:border-sage-800 transition-all flex flex-col shadow-sm"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-[4/3] w-full bg-sage-50 dark:bg-sage-950 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={memory.image_url}
                  alt={memory.title}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-3 text-[9px] text-white/90 font-semibold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-[2px]">
                  {memory.date}
                </div>
              </div>
              <div className="p-3.5 flex flex-col gap-0.5">
                <h3 className="text-xs font-bold text-foreground/90 line-clamp-1">
                  {memory.title}
                </h3>
                <p className="text-[10px] text-foreground/50 line-clamp-2 leading-relaxed">
                  {memory.note}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Lightbox expanded view */}
      <AnimatePresence>
        {activeMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMemory(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              <button
                onClick={() => setActiveMemory(null)}
                className="absolute top-4 right-4 p-2 rounded-full border border-border bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full aspect-video bg-sage-50 dark:bg-sage-950 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMemory.image_url}
                  alt={activeMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
                    {activeMemory.date}
                  </span>
                  <h3 className="text-base font-bold text-foreground/95 pr-6">
                    {activeMemory.title}
                  </h3>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed font-serif italic border-l-2 border-sage-300 dark:border-sage-700 pl-3.5 py-1">
                  {activeMemory.note}
                </p>

                <div className="flex justify-end mt-2">
                  <span className="text-[10px] text-sage-600 dark:text-sage-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    Für dich festgehalten
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!uploading) {
                  setShowUploadModal(false);
                  resetForm();
                }
              }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-3xl overflow-hidden shadow-2xl z-10 p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="text-base font-bold text-foreground/90">Neue Erinnerung</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  disabled={uploading}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 mt-2">
                
                {/* Image Upload Area */}
                <div 
                  className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:border-sage-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-foreground/50">
                      <UploadCloud className="w-8 h-8 opacity-50" />
                      <span className="text-xs font-medium">Tippe, um ein Bild zu wählen</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Titel (z.B. Am See)"
                    disabled={uploading}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="Zeitpunkt (z.B. Sommer 2025)"
                    disabled={uploading}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/30"
                  />
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Eine liebevolle Notiz dazu..."
                    rows={3}
                    disabled={uploading}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/30 resize-none"
                  />
                </div>

                {uploadError && (
                  <div className="text-[10px] text-red-500 bg-red-500/10 p-2 rounded-lg font-medium">
                    {uploadError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Lädt hoch...
                    </>
                  ) : (
                    "Erinnerung speichern"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
