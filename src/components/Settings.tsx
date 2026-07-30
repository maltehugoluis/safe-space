"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Save, Plus, Trash2, Loader, LogOut, Check, Heart, User as UserIcon, Globe, Palette, Phone } from "lucide-react";

type AdditionalPartner = {
  name: string;
  phone: string;
};

type Profile = {
  id: string;
  email: string;
  app_mode: "receiver" | "supporter";
  linked_user_email?: string | null;
  user_name: string;
  partner_name: string;
  partner_phone: string;
  additional_partners?: AdditionalPartner[];
  country: string;
  favorite_color: string;
  pending_supporters?: string[];
  approved_supporters?: string[];
};

const COLOR_THEMES = [
  { id: "sage", name: "Salbeigrün", preview: "bg-[#62916e] border-[#3f5d47]" },
  { id: "lavender", name: "Lavendel", preview: "bg-[#856ea8] border-[#5c477e]" },
  { id: "rose", name: "Altrosa", preview: "bg-[#b5717f] border-[#844350]" },
  { id: "peach", name: "Pfirsich", preview: "bg-[#c08a65] border-[#8a5833]" },
  { id: "blue", name: "Ozeanblau", preview: "bg-[#5c86b5] border-[#3a5f8a]" },
];

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savingMode, setSavingMode] = useState(false);

  // Form states
  const [userName, setUserName] = useState("");
  const [country, setCountry] = useState("DE");
  const [favoriteColor, setFavoriteColor] = useState("sage");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [additionalPartners, setAdditionalPartners] = useState<AdditionalPartner[]>([]);
  const [appMode, setAppMode] = useState<"receiver" | "supporter">("receiver");
  const [linkedUserEmail, setLinkedUserEmail] = useState("");
  const [pendingSupporters, setPendingSupporters] = useState<string[]>([]);
  const [approvedSupporters, setApprovedSupporters] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserName(data.user_name || "");
        setCountry(data.country || "DE");
        setFavoriteColor(data.favorite_color || "sage");
        setPartnerName(data.partner_name || "");
        setPartnerPhone(data.partner_phone || "");
        setAdditionalPartners(data.additional_partners || []);
        setAppMode(data.app_mode || "receiver");
        setLinkedUserEmail(data.linked_user_email || "");
        setPendingSupporters(data.pending_supporters || []);
        setApprovedSupporters(data.approved_supporters || []);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = () => {
    setAdditionalPartners([...additionalPartners, { name: "", phone: "" }]);
  };

  const handleRemovePartner = (index: number) => {
    const updated = [...additionalPartners];
    updated.splice(index, 1);
    setAdditionalPartners(updated);
  };

  const handlePartnerChange = (index: number, field: keyof AdditionalPartner, value: string) => {
    const updated = [...additionalPartners];
    updated[index][field] = value;
    setAdditionalPartners(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setSaving(true);
    setSuccess(false);

    try {
      // Filter out empty partners
      const validPartners = additionalPartners.filter(p => p.name.trim() !== "" || p.phone.trim() !== "");

      const updates = {
        id: user.id,
        user_name: userName.trim(),
        country,
        favorite_color: favoriteColor,
        partner_name: partnerName.trim(),
        partner_phone: partnerPhone.trim(),
        additional_partners: validPartners,
        app_mode: appMode,
        linked_user_email: linkedUserEmail.trim() || null,
      };

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;

      // Update local state to filtered
      setAdditionalPartners(validPartners);
      
      // Update global theme class immediately
      const classes = Array.from(document.body.classList);
      classes.forEach(c => {
        if (c.startsWith("theme-")) document.body.classList.remove(c);
      });
      document.body.classList.add(`theme-${favoriteColor}`);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMode = async () => {
    if (!supabase || !user) return;
    setSavingMode(true);
    try {
      const updates = {
        app_mode: appMode,
        linked_user_email: linkedUserEmail.trim() || null,
      };
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
      
      if (appMode === "supporter" && linkedUserEmail.trim() && user.email) {
        const { error: rpcError } = await supabase.rpc("request_connection", { 
          target_email: linkedUserEmail.trim(),
          requester_email: user.email
        });
        if (rpcError) console.error("Error sending connection request:", rpcError);
      }

      // Reload to instantly show the new tabs
      window.location.reload();
    } catch (err) {
      console.error("Error saving mode:", err);
      setSavingMode(false);
    }
  };

  const handleAcceptConnection = async (email: string) => {
    if (!supabase) return;
    try {
      await supabase.rpc("accept_connection", { requester_email: email });
      setPendingSupporters(pendingSupporters.filter(e => e !== email));
      setApprovedSupporters([...approvedSupporters, email]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectConnection = async (email: string) => {
    if (!supabase) return;
    try {
      await supabase.rpc("reject_connection", { requester_email: email });
      setPendingSupporters(pendingSupporters.filter(e => e !== email));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveConnection = async (email: string) => {
    if (!supabase) return;
    try {
      await supabase.rpc("remove_connection", { requester_email: email });
      setApprovedSupporters(approvedSupporters.filter(e => e !== email));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[300px]">
        <Loader className="w-6 h-6 animate-spin text-sage-600 dark:text-sage-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cloud Sync Status Header */}
      <div className="w-full p-4 rounded-3xl border border-border bg-card shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-xs font-bold text-foreground/80">
              {user ? `Cloud-Synchronisiert: ${user.email}` : "Cloud-Verbindung aktiv"}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="text-[10px] font-bold border border-border px-3 py-1.5 rounded-full bg-background hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" /> Abmelden
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border pb-2 mt-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground/90 font-serif flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-sage-600 dark:text-sage-400" />
          Einstellungen
        </h2>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        
        {/* App Mode Switcher */}
        <section className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-2">
            <SettingsIcon className="w-4 h-4 text-sage-500" /> App-Modus
          </h3>
          
          <div className="flex flex-col gap-3">
            <p className="text-xs text-foreground/60 leading-relaxed mb-1">
              Wer bist du? Nutzt du die App für dich selbst, oder möchtest du jemanden unterstützen?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAppMode("receiver")}
                className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-1 ${
                  appMode === "receiver" 
                    ? "bg-sage-600 border-sage-600 text-white shadow-sm" 
                    : "bg-background border-border text-foreground/60 hover:border-sage-300"
                }`}
              >
                <Heart className={`w-4 h-4 ${appMode === "receiver" ? "text-white" : ""}`} />
                Ich suche einen Safe Space
              </button>
              <button
                type="button"
                onClick={() => setAppMode("supporter")}
                className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-1 ${
                  appMode === "supporter" 
                    ? "bg-sage-600 border-sage-600 text-white shadow-sm" 
                    : "bg-background border-border text-foreground/60 hover:border-sage-300"
                }`}
              >
                <Plus className={`w-4 h-4 ${appMode === "supporter" ? "text-white" : ""}`} />
                Ich unterstütze jemanden
              </button>
            </div>

            <AnimatePresence>
              {appMode === "supporter" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-2 border-t border-border flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/60">E-Mail-Adresse der Person, die du unterstützt</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required={appMode === "supporter"}
                        value={linkedUserEmail}
                        onChange={(e) => setLinkedUserEmail(e.target.value)}
                        placeholder="partner@example.com"
                        className="w-full flex-1 text-sm p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveMode}
                        disabled={savingMode || !linkedUserEmail.trim()}
                        className="bg-sage-600 text-white px-4 rounded-xl text-xs font-bold transition-all hover:bg-sage-700 whitespace-nowrap shadow-sm disabled:opacity-50"
                      >
                        {savingMode ? "Lädt..." : "Aktivieren"}
                      </button>
                    </div>
                    <p className="text-[10px] text-foreground/50 mt-1">
                      Die Person muss mit dieser E-Mail in der App registriert sein. Du kannst dann Briefe und Nudges an sie senden.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {appMode === "receiver" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-2 border-t border-border flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveMode}
                      disabled={savingMode}
                      className="bg-sage-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-sage-700 shadow-sm disabled:opacity-50"
                    >
                      {savingMode ? "Lädt..." : "Safe Space aktivieren"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Connection Requests (Only in Receiver Mode) */}
        <AnimatePresence>
          {appMode === "receiver" && (pendingSupporters.length > 0 || approvedSupporters.length > 0) && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4 overflow-hidden"
            >
              <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-2">
                <Globe className="w-4 h-4 text-sage-500" /> Zugelassene Supporter
              </h3>

              <div className="flex flex-col gap-4">
                {pendingSupporters.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full w-fit border border-amber-200 dark:border-amber-900">
                      Neue Anfrage erhalten
                    </span>
                    {pendingSupporters.map(email => (
                      <div key={email} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-background border border-border/80 shadow-xs">
                        <span className="text-sm font-medium text-foreground/90 truncate max-w-full font-mono text-xs sm:text-sm" title={email}>
                          {email}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAcceptConnection(email)}
                            className="flex-1 sm:flex-initial bg-sage-600 hover:bg-sage-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                          >
                            Zulassen
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectConnection(email)}
                            className="flex-1 sm:flex-initial bg-muted/60 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-border text-foreground/70 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                          >
                            Ablehnen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {approvedSupporters.length > 0 && (
                  <div className="flex flex-col gap-2.5 mt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                      Aktive Supporter
                    </span>
                    {approvedSupporters.map(email => (
                      <div key={email} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-background border border-border/80 shadow-xs">
                        <span className="text-xs sm:text-sm font-medium text-foreground/80 truncate font-mono" title={email}>
                          {email}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveConnection(email)}
                          className="text-foreground/40 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 rounded-xl transition-all shrink-0"
                          title="Supporter entfernen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Personal Details */}
        <section className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-2">
            <UserIcon className="w-4 h-4 text-sage-500" /> Dein Profil
          </h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/60">Wie dürfen wir dich nennen?</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/60">Dein Land (Für Notfall-Hotlines)</label>
            <div className="flex gap-2">
              {[
                { id: "DE", label: "🇩🇪 Deutschland" },
                { id: "AT", label: "🇦🇹 Österreich" },
                { id: "CH", label: "🇨🇭 Schweiz" }
              ].map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCountry(c.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    country === c.id 
                      ? "bg-sage-600 border-sage-600 text-white shadow-sm" 
                      : "bg-background border-border text-foreground/60 hover:border-sage-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-2">
            <Palette className="w-4 h-4 text-sage-500" /> App-Design
          </h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/60 mb-1">Wähle deine Wohlfühl-Farbe</label>
            <div className="flex flex-wrap gap-3">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFavoriteColor(theme.id)}
                  className={`relative flex items-center gap-2 p-2 rounded-xl border transition-all ${
                    favoriteColor === theme.id
                      ? "border-sage-500 bg-background shadow-sm"
                      : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border shadow-inner ${theme.preview}`} />
                  <span className={`text-xs font-medium ${favoriteColor === theme.id ? "text-foreground" : "text-foreground/60"}`}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contacts Settings */}
        <section className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground/80 flex items-center gap-1.5 border-b border-border pb-2">
            <Heart className="w-4 h-4 text-sage-500" /> Vertrauenspersonen
          </h3>
          
          <div className="p-4 bg-sage-50 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-800 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Heart className="w-16 h-16" />
            </div>
            <div className="relative z-10 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-sage-800 dark:text-sage-300 uppercase tracking-wider">Haupt-Lieblingsmensch</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-foreground/60">Name</label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Name"
                    className="w-full text-sm p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-sage-500"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-foreground/60">Telefon (für Anruf/SMS)</label>
                  <input
                    type="tel"
                    required
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="+49 151..."
                    className="w-full text-sm p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-sage-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Partners List */}
          <div className="flex flex-col gap-3 mt-2">
            <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Weitere Vertrauenspersonen</h4>
            
            <AnimatePresence initial={false}>
              {additionalPartners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 items-end"
                >
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => handlePartnerChange(index, "name", e.target.value)}
                      placeholder="Name"
                      className="w-full text-sm p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-sage-500"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <input
                      type="tel"
                      value={partner.phone}
                      onChange={(e) => handlePartnerChange(index, "phone", e.target.value)}
                      placeholder="+49 151..."
                      className="w-full text-sm p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-sage-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePartner(index)}
                    className="p-2.5 rounded-lg border border-border bg-background text-foreground/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleAddPartner}
              className="mt-1 py-2.5 w-full rounded-xl border border-dashed border-border bg-background text-foreground/60 hover:text-sage-600 hover:border-sage-300 hover:bg-sage-50 dark:hover:bg-sage-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Person hinzufügen
            </button>
          </div>
        </section>

        {/* Save Button fixed at bottom (or just end of form) */}
        <div className="pt-2 pb-6">
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              success
                ? "bg-sage-600 text-white"
                : "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {saving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : success ? (
              <>
                <Check className="w-4 h-4" /> Gespeichert!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Änderungen speichern
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
