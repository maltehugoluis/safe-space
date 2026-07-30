"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export default function NudgeOverlay() {
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    checkNudge();
    
    // Set up a real-time subscription for nudges
    if (!supabase) return;
    
    const setupSubscription = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const subscription = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${session.user.id}`
          },
          (payload) => {
            if (payload.new.has_unread_nudge === true) {
              triggerNudge();
            }
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(subscription);
      };
    };
    
    const cleanup = setupSubscription();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, []);

  const checkNudge = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("has_unread_nudge")
        .eq("id", session.user.id)
        .single();

      if (data?.has_unread_nudge) {
        triggerNudge();
      }
    } catch (err) {
      console.error("Error checking nudge:", err);
    }
  };

  const triggerNudge = async () => {
    setShowNudge(true);

    // Reset it in DB immediately so it doesn't loop
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from("profiles")
          .update({ has_unread_nudge: false })
          .eq("id", session.user.id);
      }
    }

    // Hide animation after 5 seconds
    setTimeout(() => {
      setShowNudge(false);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {showNudge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-background/40 backdrop-blur-sm"
        >
          {/* Floating Hearts Container */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: "100vh", 
                  x: `${Math.random() * 100}vw`,
                  scale: Math.random() * 1.5 + 0.5 
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: "-10vh",
                  x: `${Math.random() * 100}vw` 
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  ease: "easeOut",
                  delay: Math.random() * 1.5
                }}
                className="absolute text-rose-500"
              >
                <Heart className="w-8 h-8 fill-rose-500" />
              </motion.div>
            ))}
          </div>

          {/* Central Message */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.5 }}
            className="bg-card/90 backdrop-blur-md border border-rose-200/50 shadow-2xl p-8 rounded-3xl flex flex-col items-center gap-4 max-w-xs mx-4 text-center relative z-10"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center animate-pulse">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </div>
            <h2 className="text-xl font-bold font-serif text-foreground/90">
              Malte hat gerade an dich gedacht. 🤍
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
