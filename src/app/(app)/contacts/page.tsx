"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ActPanel } from "@/components/network/act-panel";
import { useContacts } from "@/lib/contacts-store";
import { classifyTie, daysSince } from "@/lib/scoring";
import type { Contact, TieClass } from "@/types";
import Link from "next/link";

const tieClassConfig: Record<TieClass, { label: string; color: string }> = {
  strong: { label: "Strong", color: "#4A8C5C" },
  medium: { label: "Medium", color: "#B8860B" },
  weak: { label: "Weak", color: "#C44820" },
};

function formatLastContact(last_contact: string | undefined): string {
  if (!last_contact) return "—";
  const days = daysSince(last_contact);
  if (days === Infinity) return "—";
  if (days === 0) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function ContactsPage() {
  const { contacts } = useContacts();
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [actContact, setActContact] = useState<Contact | null>(null);

  const industries = [
    "all",
    ...Array.from(new Set(contacts.map((c) => c.industry || "Other").filter(Boolean))),
  ];

  const filtered = contacts.filter((c) => {
    const matchSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role?.toLowerCase().includes(search.toLowerCase()) ||
      c.organization?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchIndustry = selectedIndustry === "all" || c.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  const dormantCount = contacts.filter((c) => daysSince(c.last_contact) > 90).length;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-light text-[#F5F0E8] mb-1"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Contacts
          </h1>
          <p className="text-sm text-[#4A4640] font-body">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} &middot; {dormantCount} dormant
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="primary" size="sm">+ Add contact</Button>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search contacts, roles, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`h-7 px-3 rounded-[3px] text-xs font-body font-medium transition-all duration-100 capitalize ${
                selectedIndustry === ind
                  ? "bg-[#1E1E1E] text-[#F5F0E8]"
                  : "text-[#4A4640] hover:text-[#8A8578]"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title="No contacts yet"
          description="Import your LinkedIn connections or add contacts manually to start mapping your network."
          action={
            <div className="flex items-center gap-2">
              <Link href="/onboarding">
                <Button variant="primary" size="sm">Import from LinkedIn</Button>
              </Link>
              <Link href="/onboarding?step=manual">
                <Button variant="secondary" size="sm">Add manually</Button>
              </Link>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M32 32l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title="No contacts found"
          description={
            search
              ? `No contacts match "${search}". Try a different search.`
              : `No contacts in ${selectedIndustry}. Try a different filter.`
          }
          action={
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setSelectedIndustry("all"); }}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-[#1F1F1F]">
            <span className="col-span-3 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Name</span>
            <span className="col-span-2 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Role</span>
            <span className="col-span-2 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Organization</span>
            <span className="col-span-2 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Sector</span>
            <span className="col-span-1 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Tie</span>
            <span className="col-span-1 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Score</span>
            <span className="col-span-1 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Last</span>
          </div>

          <div className="divide-y divide-[#1F1F1F]">
            {filtered.map((c) => {
              const tie = classifyTie(c);
              const cfg = tieClassConfig[tie];
              const lastStr = formatLastContact(c.last_contact);

              return (
                <div
                  key={c.id}
                  className="grid grid-cols-12 gap-3 px-5 py-3 hover:bg-[#161616] transition-colors cursor-pointer items-center group"
                  onClick={() => setActContact(c)}
                >
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium text-[#8A8578] font-body">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#F5F0E8] font-body truncate">{c.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[#8A8578] font-body truncate block">{c.role ?? "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[#4A4640] font-body truncate block">{c.organization ?? "—"}</span>
                  </div>
                  <div className="col-span-2">
                    {c.industry ? (
                      <Badge variant="muted">{c.industry}</Badge>
                    ) : (
                      <span className="text-xs text-[#2A2A2A] font-body">—</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Badge variant={tie === "strong" ? "success" : tie === "weak" ? "accent" : "warning"}>
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span
                      className="text-sm font-light text-[#F5F0E8]"
                      style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                    >
                      {c.social_capital_score}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-[#4A4640] font-body">{lastStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Act panel */}
      <ActPanel
        contact={actContact}
        allContacts={contacts}
        onClose={() => setActContact(null)}
      />
    </div>
  );
}
