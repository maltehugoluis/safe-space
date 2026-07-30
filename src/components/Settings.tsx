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
  user_name: string;
  partner_name: string;
  partner_phone: string;
  additional_partners?: AdditionalPartner[];
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

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [userName, setUserName] = useState("");
  const [country, setCountry] = useState("DE");
  const [favoriteColor, setFavoriteColor] = useState("sage");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [additionalPartners, setAdditionalPartners] = useState<AdditionalPartner[]>([]);

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
        <div className="sticky bottom-20 pt-2 pb-6 z-20 bg-gradient-to-t from-background via-background to-transparent">
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
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
