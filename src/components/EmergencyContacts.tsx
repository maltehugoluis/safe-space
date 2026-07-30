"use client";

import React from "react";
import { Phone, MessageSquare, ShieldAlert, Heart } from "lucide-react";

type Contact = {
  name: string;
  role: string;
  phone: string;
  sms?: string;
  isPrimary?: boolean;
};

const CONTACTS: Contact[] = [
  {
    name: "Lieblingsmensch (Ich)",
    role: "Deine engste Vertrauensperson. Ruf mich jederzeit an.",
    phone: "+49123456789", // Placeholder, user can edit this
    sms: "+49123456789",
    isPrimary: true,
  },
  {
    name: "TelefonSeelsorge",
    role: "Kostenlos, anonym und 24/7 erreichbar bei Krisen.",
    phone: "08001110111",
  },
  {
    name: "Info-Telefon Depression",
    role: "Kostenfreie Beratung der Dt. Depressionshilfe.",
    phone: "08003344533",
  },
  {
    name: "Rettungsdienst (Notfall)",
    role: "Für akute medizinische Krisen und Lebensgefahr.",
    phone: "112",
  },
];

export default function EmergencyContacts() {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-sm font-semibold tracking-wide text-foreground/85 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-beige-600 dark:text-beige-400" />
          Wichtige Kontakte
        </h2>
        <p className="text-xs text-foreground/60 leading-relaxed">
          Niemand muss da alleine durchgehen. Hier erreichst du mich oder professionelle Krisenhelfer direkt.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CONTACTS.map((contact, idx) => (
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
                  {contact.isPrimary && <Heart className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 fill-current" />}
                  {contact.name}
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed mt-0.5">
                  {contact.role}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${contact.phone}`}
                className="flex-1 py-2 rounded-xl bg-background border border-border hover:bg-sage-50 dark:hover:bg-sage-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 opacity-75" />
                Anrufen
              </a>
              {contact.sms && (
                <a
                  href={`sms:${contact.sms}?body=Hallo, ich brauche gerade Unterstützung. Melde dich bitte.`}
                  className="flex-1 py-2 rounded-xl bg-background border border-border hover:bg-sage-50 dark:hover:bg-sage-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
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
