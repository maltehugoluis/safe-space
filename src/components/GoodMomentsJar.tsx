"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Plus, Loader, Sparkles } from "lucide-react";

type Moment = {
  id: string;
  text: string;
  created_at: string;
};

export default function GoodMomentsJar() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMoment, setNewMoment] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // "Pouring" state
  const [isPoured, setIsPoured] = useState(false);
  const [pouredMoments, setPouredMoments] = useState<Moment[]>([]);

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("good_moments")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMoments(data || []);
    } catch (err) {
      console.error("Error fetching good moments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoment.trim() || !supabase) return;
    
    setIsAdding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("good_moments")
        .insert([{ user_id: session.user.id, text: newMoment.trim() }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMoments([data, ...moments]);
        setNewMoment("");
      }
    } catch (err) {
      console.error("Error adding good moment:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handlePourOut = () => {
    if (moments.length === 0) return;
    
    // Shuffle and pick up to 10 moments
    const shuffled = [...moments].sort(() => 0.5 - Math.random());
    setPouredMoments(shuffled.slice(0, 10));
    setIsPoured(true);
  };

  const colors = [
    "bg-sage-100 dark:bg-sage-900/60 text-sage-900 dark:text-sage-100",
    "bg-lavender-100 dark:bg-lavender-900/60 text-lavender-900 dark:text-lavender-100",
    "bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100",
    "bg-peach-100 dark:bg-peach-900/60 text-peach-900 dark:text-peach-100",
    "bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100"
  ];

  return (
    <div className="flex flex-col gap-6 bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden">
      <h2 className="text-sm font-bold text-foreground/80 flex items-center justify-between border-b border-border pb-3">
        <span className="flex items-center gap-1.5">
          <Coffee className="w-4 h-4 text-sage-500" />
          Einmachglas der guten Momente
        </span>
        <span className="text-[10px] font-bold bg-sage-100 dark:bg-sage-900 text-sage-700 dark:text-sage-300 px-2 py-1 rounded-full">
          {moments.length} Zettel
        </span>
      </h2>
      
      <p className="text-xs text-foreground/50 leading-relaxed -mt-2">
        An schlechten Tagen vergisst man oft das Gute. Wirf hier kleine, schöne Momente rein und schütte das Glas aus, wenn du Aufmunterung brauchst.
      </p>

      {/* Add new moment form */}
      <form onSubmit={handleAddMoment} className="flex gap-2">
        <input
          type="text"
          value={newMoment}
          onChange={(e) => setNewMoment(e.target.value)}
          placeholder="Etwas schönes von heute..."
          className="flex-1 text-sm p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
        />
        <button
          type="submit"
          disabled={!newMoment.trim() || isAdding}
          className="bg-sage-600 text-white disabled:opacity-50 px-4 rounded-xl text-xs font-bold transition-all hover:bg-sage-700 flex items-center justify-center min-w-[3rem]"
        >
          {isAdding ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {/* Pour out button */}
      <button
        onClick={handlePourOut}
        disabled={moments.length === 0 || isPoured}
        className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm border border-border bg-background text-foreground hover:bg-sage-50 dark:hover:bg-sage-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4 text-yellow-500" /> 
        Glas ausschütten
      </button>

      {/* Poured Moments Display */}
      <AnimatePresence>
        {isPoured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-md relative flex flex-col items-center gap-4">
              <h3 className="text-lg font-serif font-bold text-foreground text-center mb-4">
                Das steckt in deinem Glas 🤍
              </h3>
              
              <div className="flex flex-wrap justify-center gap-3 perspective-1000">
                {pouredMoments.map((moment, index) => {
                  const randomRotate = (Math.random() - 0.5) * 10;
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <motion.div
                      key={moment.id}
                      initial={{ opacity: 0, y: -100, rotate: randomRotate - 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, rotate: randomRotate, scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        damping: 12, 
                        stiffness: 100, 
                        delay: index * 0.1 
                      }}
                      className={`p-4 rounded-xl shadow-md max-w-[200px] text-sm font-medium ${colorClass}`}
                    >
                      "{moment.text}"
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pouredMoments.length * 0.1 + 0.5 }}
                onClick={() => setIsPoured(false)}
                className="mt-8 bg-foreground text-background px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-all"
              >
                Zettel wieder einräumen
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
