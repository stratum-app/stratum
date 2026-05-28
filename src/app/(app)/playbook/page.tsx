"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActPanel } from "@/components/network/act-panel";
import { useContacts } from "@/lib/contacts-store";
import {
  classifyTie,
  daysSince,
  isDormant,
  opportunityScore,
  whyThisContact,
} from "@/lib/scoring";
import type { Contact, TieClass } from "@/types";
import Link from "next/link";

type ActionType = "reactivate" | "leverage" | "deepen" | "introduce";
type Status = "pending" | "done" | "dismissed";

interface DerivedEntry {
  contact: Contact;
  action_type: ActionType;
  title: string;
  rationale: string;
  status: Status;
}

const actionTypeConfig: Record<ActionType, { label: string; variant: "accent" | "success" | "default" | "warning" }> = {
  reactivate: { label: "Reactivate", variant: "accent" },
  leverage: { label: "Leverage", variant: "warning" },
  deepen: { label: "Deepen", variant: "success" },
  introduce: { label: "Introduce", variant: "default" },
};

function deriveActionType(c: Contact, all: Contact[]): ActionType {
  if (isDormant(c)) return "reactivate";
  const tie = classifyTie(c);
  const sectorCount = all.filter((x) => x.industry && x.industry === c.industry).length;
  if (tie === "weak" && sectorCount < 3) return "leverage";
  if (tie === "weak") return "deepen";
  return "leverage";
}

function deriveTitle(c: Contact, actionType: ActionType, all: Contact[]): string {
  const firstName = c.name.split(" ")[0];
  const days = daysSince(c.last_contact);
  switch (actionType) {
    case "reactivate":
      if (days === Infinity) return `Start a conversation with ${firstName}`;
      if (days > 180) return `Reconnect with ${firstName} — ${Math.floor(days / 30)} months of silence`;
      return `Reactivate ${firstName} before this tie fades`;
    case "leverage": {
      const sector = c.industry ? `in ${c.industry}` : "in their sector";
      return `${firstName} has rare reach ${sector} — worth activating`;
    }
    case "deepen":
      return `Convert ${firstName} from a weak tie to a real relationship`;
    case "introduce":
      return `${firstName} could bridge you to a new cluster`;
  }
}

const priorityDot: Record<string, string> = {
  high: "#C44820",
  medium: "#B8860B",
  low: "#4A4640",
};

function scoreToPriority(score: number): "high" | "medium" | "low" {
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

export default function PlaybookPage() {
  const { contacts } = useContacts();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [actContact, setActContact] = useState<Contact | null>(null);

  // Build derived entries sorted by opportunity score
  const entries: DerivedEntry[] = contacts
    .map((c) => {
      const actionType = deriveActionType(c, contacts);
      return {
        contact: c,
        action_type: actionType,
        title: deriveTitle(c, actionType, contacts),
        rationale: whyThisContact(c, contacts),
        status: done.has(c.id)
          ? "done"
          : dismissed.has(c.id)
          ? "dismissed"
          : "pending",
      } as DerivedEntry;
    })
    .sort(
      (a, b) =>
        opportunityScore(b.contact, contacts) - opportunityScore(a.contact, contacts)
    );

  const filtered =
    filter === "all"
      ? entries
      : entries.filter((e) => e.status === filter);

  const pendingCount = entries.filter((e) => e.status === "pending").length;

  if (contacts.length === 0) {
    return (
      <div className="p-8 max-w-3xl">
        <h1
          className="text-3xl font-light text-[#F5F0E8] mb-1"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Playbook
        </h1>
        <p className="text-sm text-[#4A4640] font-body mb-8">
          AI-prioritized actions based on your network
        </p>
        <EmptyState
          icon={
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <path d="M24 8l4 12h12l-10 7 4 12-10-7-10 7 4-12L8 20h12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          }
          title="No playbook yet"
          description="Add contacts to generate a prioritized action list ranked by opportunity score."
          action={
            <Link href="/onboarding">
              <Button variant="primary" size="sm">Add contacts</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-light text-[#F5F0E8] mb-1"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Playbook
          </h1>
          <p className="text-sm text-[#4A4640] font-body">
            {pendingCount} action{pendingCount !== 1 ? "s" : ""} recommended &middot; ranked by opportunity score
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6">
        {(["pending", "done", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-7 px-3 rounded-[3px] text-xs font-body font-medium transition-all duration-100 capitalize ${
              filter === f
                ? "bg-[#1E1E1E] text-[#F5F0E8]"
                : "text-[#4A4640] hover:text-[#8A8578]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <path d="M8 40L24 8l16 32H8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M24 20v10M24 34v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          title={filter === "done" ? "Nothing completed yet" : "Playbook is clear"}
          description={
            filter === "done"
              ? "Complete actions from your playbook to see them here."
              : "You've worked through all your recommendations."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, idx) => {
            const cfg = actionTypeConfig[entry.action_type];
            const isExpanded = expanded === entry.contact.id;
            const isDoneEntry = entry.status === "done";
            const score = opportunityScore(entry.contact, contacts);
            const priority = scoreToPriority(score);

            return (
              <Card
                key={entry.contact.id}
                className={`transition-all duration-200 ${isDoneEntry ? "opacity-40" : ""}`}
              >
                <CardContent className="py-4 px-5">
                  {/* Header row */}
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : entry.contact.id)}
                  >
                    {/* Priority + index */}
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ backgroundColor: priorityDot[priority] }}
                      />
                      <span className="text-xs text-[#2A2A2A] font-body w-4">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-[#F5F0E8] font-body">
                          {entry.contact.name}
                        </span>
                        {entry.contact.role && (
                          <span className="text-xs text-[#4A4640] font-body">
                            {entry.contact.role}
                          </span>
                        )}
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-[#8A8578] font-body">{entry.title}</p>
                    </div>

                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 14 14"
                      className={`text-[#2A2A2A] shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="mt-4 ml-7 space-y-4 animate-fade-up">
                      <div>
                        <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1.5">
                          Why now
                        </p>
                        <p className="text-sm text-[#8A8578] font-body leading-relaxed">
                          {entry.rationale}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#4A4640] font-body">
                        <span>Opportunity score: <span className="text-[#8A8578]">{score}</span></span>
                        <span>·</span>
                        <span>Tie strength: <span className="text-[#8A8578]">{entry.contact.tie_strength}/5</span></span>
                        {entry.contact.industry && (
                          <>
                            <span>·</span>
                            <span>{entry.contact.industry}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActContact(entry.contact)}
                        >
                          Act on this
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setDone((prev) => new Set(prev).add(entry.contact.id));
                            setExpanded(null);
                          }}
                          disabled={isDoneEntry}
                        >
                          {isDoneEntry ? "Done" : "Mark done"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDismissed((prev) => new Set(prev).add(entry.contact.id));
                            setExpanded(null);
                          }}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
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
