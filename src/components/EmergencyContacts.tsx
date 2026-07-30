"use client";

import React, { useState, useEffect } from "react";
import { Phone, MessageSquare, ShieldAlert, Heart, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Contact = {
  name: string;
  role: string;
  phone: string;
  sms?: string;
  isPrimary?: boolean;
};

const DEFAULT_DE_CONTACTS: Contact[] = [
  {
    name: "Lieblingsmensch",
    role: "Deine engste Vertrauensperson. Ruf mich jederzeit an.",
    phone: "",
    isPrimary: true,
  },
  {
    name: "TelefonSeelsorge (DE)",
    role: "Kostenlos, anonym und 24/7 erreichbar bei Krisen.",
    phone: "08001110111",
  },
  {
    name: "Info-Telefon Depression (DE)",
    role: "Kostenfreie Beratung der Dt. Depressionshilfe.",
    phone: "08003344533",
  },
  {
    name: "Rettungsdienst (Notfall DE)",
    role: "Für akute medizinische Krisen und Lebensgefahr.",
    phone: "112",
  },
];

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_DE_CONTACTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // 1. Fetch user profile for partner phone number and country code
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileErr) throw profileErr;

      if (!profile) {
        setLoading(false);
        return;
      }

      // 2. Fetch country helplines (Don't throw if this fails, just fallback to empty array)
      const { data: hotlines, error: hotlinesErr } = await supabase
        .from("countries_hotlines")
        .select("*")
        .eq("country_code", profile.country);

      if (hotlinesErr) {
        console.warn("Could not load regional hotlines:", hotlinesErr);
      }

      // 3. Assemble primary partner contact
      const primaryContact: Contact = {
        name: profile.partner_name ? `${profile.partner_name} (Lieblingsmensch)` : "Lieblingsmensch",
        role: `Deine engste Vertrauensperson. Antworte oder rufe an.`,
        phone: profile.partner_phone || "",
        sms: profile.partner_phone || "",
        isPrimary: true,
      };

      // 4. Map DB hotlines
      const mappedHotlines: Contact[] = (hotlines || []).map((h) => ({
        name: h.name,
        role: h.role,
        phone: h.phone,
      }));

      // Combine (if DB hotlines are empty due to error or missing data, fallback to DE defaults for hotlines only)
      if (mappedHotlines.length === 0) {
        const defaultHelplines = DEFAULT_DE_CONTACTS.filter(c => !c.isPrimary);
        setContacts([primaryContact, ...defaultHelplines]);
      } else {
        setContacts([primaryContact, ...mappedHotlines]);
      }
    } catch (err) {
      console.error("Error loading contacts from database:", err);
      // Fallback is already DEFAULT_DE_CONTACTS
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center min-h-32">
        <Loader className="w-6 h-6 animate-spin text-sage-600 dark:text-sage-400 mb-1" />
        <span className="text-[10px] text-foreground/50 tracking-wider">Lade Kontakte...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/85 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-sage-600 dark:text-sage-400" />
          Wichtige Kontakte
        </h2>
        <p className="text-xs text-foreground/60 leading-relaxed">
          Niemand muss da alleine durchgehen. Hier erreichst du deinen Lieblingsmenschen oder professionelle Krisenhelfer direkt.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-sm ${
              contact.isPrimary
                ? "bg-sage-100/50 border-sage-300 dark:bg-sage-950/40 dark:border-sage-800"
                : "bg-card border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  {contact.isPrimary && <Heart className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 fill-current animate-pulse" />}
                  {contact.name}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed mt-0.5">
                  {contact.role}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 py-2.5 rounded-xl bg-background border border-border hover:bg-sage-50 dark:hover:bg-sage-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 opacity-75" />
                  Anrufen
                </a>
              ) : (
                <span className="flex-1 py-2.5 rounded-xl bg-background border border-border opacity-50 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Keine Nummer
                </span>
              )}
              {contact.sms && (
                <a
                  href={`sms:${contact.sms}?body=Hallo, ich brauche gerade Unterstützung. Melde dich bitte.`}
                  className="flex-1 py-2.5 rounded-xl bg-background border border-border hover:bg-sage-50 dark:hover:bg-sage-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 opacity-75" />
                  SMS senden
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
