"use client";

import { useState } from "react";
import { NetworkGraph } from "@/components/network/network-graph";
import { ActPanel } from "@/components/network/act-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContacts } from "@/lib/contacts-store";
import { classifyTie } from "@/lib/scoring";
import type { Contact, TieClass } from "@/types";
import Link from "next/link";

const tieColors: Record<TieClass, string> = {
  strong: "#4A8C5C",
  medium: "#B8860B",
  weak: "#C44820",
};

const tieLabels: Record<TieClass, string> = {
  strong: "Strong tie",
  medium: "Medium tie",
  weak: "Weak tie",
};

export default function NetworkPage() {
  const { contacts } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [actContact, setActContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<TieClass | "all">("all");

  const filtered =
    filter === "all"
      ? contacts
      : contacts.filter((c) => classifyTie(c) === filter);

  if (contacts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8 bg-[#0A0A0A]">
        <p className="text-sm text-[#2A2A2A] font-body mb-4">No contacts to map yet.</p>
        <Link href="/onboarding">
          <Button variant="primary" size="sm">Add contacts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-5 border-b border-[#1F1F1F] bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-1">
          {(["all", "strong", "medium", "weak"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-6 px-3 rounded-[3px] text-xs font-body font-medium transition-all duration-100 ${
                filter === f
                  ? "bg-[#1E1E1E] text-[#F5F0E8]"
                  : "text-[#4A4640] hover:text-[#8A8578]"
              }`}
            >
              {f === "all" ? `All (${contacts.length})` : tieLabels[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {(Object.entries(tieColors) as [TieClass, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-[#4A4640] font-body">{tieLabels[type]}</span>
              </div>
            ))}
          </div>
          <Link href="/onboarding">
            <Button variant="primary" size="sm">+ Add contact</Button>
          </Link>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 flex relative">
        <div className="flex-1">
          <NetworkGraph
            contacts={filtered}
            onNodeClick={(c) => {
              setSelectedContact(c);
              setActContact(null);
            }}
          />
        </div>

        {/* Contact detail side panel */}
        {selectedContact && !actContact && (
          <div className="w-72 bg-[#161616] border-l border-[#1F1F1F] p-5 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-lg font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {selectedContact.name}
                </h3>
                <p className="text-xs text-[#4A4640] font-body mt-0.5">
                  {[selectedContact.role, selectedContact.organization].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-[#2A2A2A] hover:text-[#8A8578] transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Tie class */}
            {(() => {
              const tie = classifyTie(selectedContact);
              return (
                <div>
                  <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Tie class</p>
                  <Badge
                    variant={tie === "strong" ? "success" : tie === "weak" ? "accent" : "warning"}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tieColors[tie] }}
                    />
                    {tieLabels[tie]} · {selectedContact.tie_strength}/5
                  </Badge>
                </div>
              );
            })()}

            {/* Scores */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1E1E1E] rounded-[4px] p-3">
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1">Capital</p>
                <span
                  className="text-2xl font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {selectedContact.social_capital_score}
                </span>
              </div>
              {selectedContact.industry && (
                <div className="bg-[#1E1E1E] rounded-[4px] p-3">
                  <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1">Sector</p>
                  <span className="text-xs text-[#8A8578] font-body">{selectedContact.industry}</span>
                </div>
              )}
            </div>

            {selectedContact.tags?.length > 0 && (
              <div>
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selectedContact.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="muted">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setActContact(selectedContact)}
              >
                Act on this contact
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Act panel */}
      <ActPanel
        contact={actContact}
        allContacts={contacts}
        onClose={() => setActContact(null)}
      />
    </div>
  );
}
