"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader, ArrowRight, ArrowLeft, Check, Lock, ShieldAlert, Sparkles } from "lucide-react";

type Profile = {
  id: string;
  user_name: string;
  partner_name: string;
  partner_phone: string;
  country: string;
  favorite_color: string;
};

const COLOR_THEMES = [
  { id: "sage", name: "Salbeigrün", preview: "bg-[#62916e] border-[#3f5d47]" },
  { id: "lavender", name: "Lavendel", preview: "bg-[#856ea8] border-[#5c477e]" },
  { id: "rose", name: "Altrosa", preview: "bg-[#b5717f] border-[#844350]" },
  { id: "peach", name: "Pfirsich", preview: "bg-[#c08a65] border-[#8a5833]" },
  { id: "blue", name: "Ozeanblau", preview: "bg-[#5c86b5] border-[#3a5f8a]" },
];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states (Auth)
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Onboarding Wizard states
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [country, setCountry] = useState("DE");
  const [favoriteColor, setFavoriteColor] = useState("sage");
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Auth Listener
  useEffect(() => {
    // Check session on mount
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setProfile(null);
        setNeedsOnboarding(false);
        setLoading(false);
      }
    }) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (err) {
      console.error("Error checking profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          setNeedsOnboarding(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await checkProfile(data.user.id);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentifizierungsfehler.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setOnboardingLoading(true);

    try {
      const newProfile = {
        id: user.id,
        user_name: userName.trim(),
        partner_name: partnerName.trim(),
        partner_phone: partnerPhone.trim(),
        country,
        favorite_color: favoriteColor,
      };

      const { error } = await supabase.from("profiles").upsert(newProfile);
      if (error) throw error;

      // Sync default achievements table for the user
      const defaultAchs = [
        { id: "1", user_id: user.id, text: "Aus dem Bett aufgestanden", checked: false },
        { id: "2", user_id: user.id, text: "Ein Glas Wasser getrunken", checked: false },
        { id: "3", user_id: user.id, text: "Tief durchgeatmet", checked: false },
        { id: "4", user_id: user.id, text: "Etwas gegessen", checked: false },
      ];
      await supabase.from("achievements").upsert(defaultAchs);

      setProfile(newProfile);
      setNeedsOnboarding(false);
    } catch (err: any) {
      alert("Fehler beim Speichern des Profils: " + err.message);
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#222c26] dark:bg-[#111513] dark:text-[#eae6df] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-sage-600 dark:text-sage-400 mb-2" />
        <span className="text-xs font-semibold tracking-widest uppercase opacity-75">Sicherer Rückzugsort lädt...</span>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#222c26] dark:bg-[#111513] dark:text-[#eae6df] flex items-center justify-center p-4">
        {/* Soft Ambient Glows */}
        <div className="ambient-glow bg-[#cfe0d3] dark:bg-[#1c2721] top-[-100px] left-[-100px]" aria-hidden="true" />
        <div className="ambient-glow bg-[#e7e5d3] dark:bg-[#28332c] bottom-[-150px] right-[-100px]" aria-hidden="true" />

        <div className="w-full max-w-sm bg-card border border-border rounded-[32px] p-8 shadow-xl flex flex-col gap-6 relative z-10">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-sage-100 dark:bg-sage-950/40 rounded-full flex items-center justify-center text-sage-600 dark:text-sage-400 mb-2">
              <Heart className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-serif">Dein Safe Space</h1>
            <p className="text-xs text-foreground/60 max-w-xs leading-relaxed">
              Bitte melde dich an oder erstelle ein Konto, um deinen persönlichen, privaten Rückzugsort zu betreten.
            </p>
          </div>

          <form onSubmit={handleLoginRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground/65">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="beispiel@domain.com"
                className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pass" className="text-xs font-semibold text-foreground/65">
                Passwort
              </label>
              <input
                id="pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
              />
            </div>

            {authError && (
              <p className="text-[10px] font-semibold text-[#b85c5c] bg-[#b85c5c]/10 p-3 rounded-2xl border border-[#b85c5c]/20 leading-relaxed">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {authLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : isRegistering ? (
                "Konto erstellen"
              ) : (
                "Einloggen"
              )}
            </button>
          </form>

          <div className="border-t border-border pt-4 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-xs text-foreground/60 hover:text-sage-600 hover:underline font-semibold"
            >
              {isRegistering ? "Bereits registriert? Hier anmelden" : "Neu hier? Eigenen Safe Space erstellen"}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-foreground/45 mt-2">
            <Lock className="w-3 h-3" />
            <span>Ende-zu-Ende gesicherte Verbindung</span>
          </div>
        </div>
      </div>
    );
  }

  // Needs Onboarding Profile Creation Screen
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-[#faf9f6] text-[#222c26] dark:bg-[#111513] dark:text-[#eae6df] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-[32px] p-8 shadow-xl flex flex-col gap-6 relative z-10">
          
          {/* Progress Header */}
          <div className="flex justify-between items-center text-[10px] text-foreground/50 uppercase tracking-widest font-bold">
            <span>Einrichtung</span>
            <span>Schritt {onboardingStep} von 4</span>
          </div>

          <form onSubmit={handleSaveOnboarding} className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2 className="text-base font-bold font-serif flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sage-600" /> Wer gehört zum Safe Space?
                    </h2>
                    <p className="text-[11px] text-foreground/60 leading-relaxed mt-1">
                      Lass uns euren Rückzugsort personalisieren.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="uName" className="text-xs font-semibold text-foreground/65">
                      Dein Vorname
                    </label>
                    <input
                      id="uName"
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Dein Name"
                      className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pName" className="text-xs font-semibold text-foreground/65">
                      Name deines Lieblingsmenschen
                    </label>
                    <input
                      id="pName"
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="z.B. dein Partner / deine Partnerin"
                      className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
                    />
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2 className="text-base font-bold font-serif flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-sage-600" /> Notfall & Sicherheit
                    </h2>
                    <p className="text-[11px] text-foreground/60 leading-relaxed mt-1">
                      Diese Nummern ermöglichen im Ernstfall die sofortige Kontaktaufnahme.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="pPhone" className="text-xs font-semibold text-foreground/65">
                      Telefonnummer deines Lieblingsmenschen
                    </label>
                    <input
                      id="pPhone"
                      type="tel"
                      required
                      value={partnerPhone}
                      onChange={(e) => setPartnerPhone(e.target.value)}
                      placeholder="z.B. +491701234567"
                      className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="country" className="text-xs font-semibold text-foreground/65">
                      Dein aktuelles Land (für Hilfetelefone)
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:border-sage-500"
                    >
                      <option value="DE">Deutschland (DE)</option>
                      <option value="AT">Österreich (AT)</option>
                      <option value="CH">Schweiz (CH)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h2 className="text-base font-bold font-serif flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sage-600" /> Wähle deine Wohlfühlfarbe
                    </h2>
                    <p className="text-[11px] text-foreground/60 leading-relaxed mt-1">
                      Das gesamte Design der App passt sich deiner Wahl an. Du kannst sie jederzeit wieder ändern.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3.5 mt-2">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        type="button"
                        key={theme.id}
                        onClick={() => setFavoriteColor(theme.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                          favoriteColor === theme.id
                            ? "bg-card border-sage-500 scale-[1.01]"
                            : "bg-background border-border hover:border-sage-200"
                        }`}
                      >
                        <span className="text-xs font-semibold">{theme.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border ${theme.preview}`} />
                          {favoriteColor === theme.id && <Check className="w-4 h-4 text-sage-600" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {onboardingStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-4 flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-sage-100 dark:bg-sage-950/40 text-sage-600 dark:text-sage-400 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif">Alles bereit!</h2>
                    <p className="text-xs text-foreground/60 leading-relaxed mt-2 max-w-xs">
                      Dein sicherer Rückzugsort wurde konfiguriert. Du kannst ihn jetzt betreten.
                    </p>
                  </div>
                  
                  <div className="w-full text-left p-4 rounded-2xl border border-border bg-background/55 text-[11px] leading-relaxed text-foreground/75 space-y-1">
                    <div><b>Name:</b> {userName}</div>
                    <div><b>Lieblingsmensch:</b> {partnerName} ({partnerPhone})</div>
                    <div><b>Land:</b> {country === "DE" ? "Deutschland" : country === "AT" ? "Österreich" : "Schweiz"}</div>
                    <div><b>Farbe:</b> {COLOR_THEMES.find(c => c.id === favoriteColor)?.name}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-border pt-4">
              {onboardingStep > 1 && onboardingStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep((prev) => prev - 1)}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Zurück
                </button>
              ) : (
                <div />
              )}

              {onboardingStep < 4 ? (
                <button
                  type="button"
                  disabled={
                    (onboardingStep === 1 && (!userName || !partnerName)) ||
                    (onboardingStep === 2 && (!partnerPhone || !country))
                  }
                  onClick={() => setOnboardingStep((prev) => prev + 1)}
                  className="bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs py-3 px-6 rounded-full flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-all ml-auto"
                >
                  Weiter <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={onboardingLoading}
                  className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs py-3 px-6 rounded-full flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 transition-all"
                >
                  {onboardingLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    "Safe Space betreten"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Wrapper applying active theme class dynamically to children
  return (
    <div className={`theme-${profile?.favorite_color || "sage"} min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500`}>
      {children}
    </div>
  );
}
