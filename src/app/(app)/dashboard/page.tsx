"use client";

import { useState } from "react";
import { ScoreRing } from "@/components/ui/score-ring";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, InfoIcon } from "@/components/ui/tooltip";
import { ActPanel } from "@/components/network/act-panel";
import { useContacts } from "@/lib/contacts-store";
import {
  networkScore,
  opportunityScore,
  classifyTie,
  daysSince,
  whyThisContact,
} from "@/lib/scoring";
import type { Contact } from "@/types";
import Link from "next/link";

const tieClassColors = {
  strong: "#4A8C5C",
  medium: "#B8860B",
  weak: "#C44820",
};

function EmptyNetwork() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
      {/* SVG constellation */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-8 opacity-20">
        <circle cx="60" cy="60" r="6" fill="#C44820" />
        <circle cx="20" cy="30" r="4" fill="#F5F0E8" opacity="0.6" />
        <circle cx="100" cy="25" r="4" fill="#F5F0E8" opacity="0.6" />
        <circle cx="15" cy="85" r="4" fill="#F5F0E8" opacity="0.6" />
        <circle cx="105" cy="80" r="4" fill="#F5F0E8" opacity="0.6" />
        <circle cx="55" cy="105" r="3" fill="#F5F0E8" opacity="0.4" />
        <line x1="60" y1="60" x2="20" y2="30" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
        <line x1="60" y1="60" x2="100" y2="25" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
        <line x1="60" y1="60" x2="15" y2="85" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
        <line x1="60" y1="60" x2="105" y2="80" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
        <line x1="60" y1="60" x2="55" y2="105" stroke="#F5F0E8" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
        <line x1="20" y1="30" x2="100" y2="25" stroke="#F5F0E8" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="15" y1="85" x2="55" y2="105" stroke="#F5F0E8" strokeWidth="0.5" strokeOpacity="0.15" />
      </svg>

      <h2
        className="text-2xl font-light text-[#F5F0E8] mb-3"
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        Your network map is empty.
        <br />
        Let&rsquo;s change that.
      </h2>
      <p className="text-sm text-[#4A4640] font-body max-w-sm mb-8 leading-relaxed">
        Stratum maps your relationships and surfaces who to reach out to, and when. Add your first connections to get started.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/onboarding">
          <Button variant="primary" size="sm">Import from LinkedIn</Button>
        </Link>
        <Link href="/onboarding?step=manual">
          <Button variant="secondary" size="sm">Add manually</Button>
        </Link>
      </div>
    </div>
  );
}

function LastStr({ days }: { days: number }) {
  if (days === Infinity) return <>Never</>;
  if (days > 365) return <>{Math.floor(days / 365)}y ago</>;
  if (days > 30) return <>{Math.floor(days / 30)}mo ago</>;
  return <>{days}d ago</>;
}

export default function DashboardPage() {
  const { contacts } = useContacts();
  const [tab, setTab] = useState<"playbook" | "recent">("playbook");
  const [actContact, setActContact] = useState<Contact | null>(null);

  if (contacts.length === 0) {
    return <EmptyNetwork />;
  }

  const score = networkScore(contacts);

  // Playbook: sort by opportunity score desc
  const playbookContacts = [...contacts]
    .sort((a, b) => opportunityScore(b, contacts) - opportunityScore(a, contacts))
    .slice(0, 8);

  // Recent: sort by updated_at desc, take 10
  const recentContacts = [...contacts]
    .sort((a, b) => {
      const da = a.updated_at || a.created_at || "";
      const db = b.updated_at || b.created_at || "";
      return db.localeCompare(da);
    })
    .slice(0, 10);

  const displayList = tab === "playbook" ? playbookContacts : recentContacts;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-light text-[#F5F0E8] mb-1"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Your network
        </h1>
        <p className="text-sm text-[#4A4640] font-body">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} &middot; {score.dormant_count} dormant
        </p>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-4 gap-px bg-[#1F1F1F] rounded-[6px] overflow-hidden mb-6">
        {/* Overall */}
        <div className="bg-[#161616] p-6 flex flex-col items-center gap-3">
          <ScoreRing score={score.overall} size="lg" label="Capital Score" sublabel="Overall" />
          <Tooltip
            content="Weighted score: reach (40%) + sector diversity (30%) + bridging ratio (30%), minus a dormancy penalty. Based on Bourdieu's social capital framework."
            width="w-64"
          >
            <div className="flex items-center gap-1 cursor-default">
              <span className="text-[10px] text-[#4A4640] font-body">How is this calculated?</span>
              <InfoIcon />
            </div>
          </Tooltip>
        </div>

        {/* Weak tie ratio + bridge */}
        <div className="bg-[#161616] p-6 flex flex-col gap-4 justify-center">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">Weak tie ratio</p>
              <Tooltip content="Granovetter's weak tie theory: contacts outside your core circle are your primary source of new information and job opportunities. Target >50%.">
                <InfoIcon />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {score.weak_tie_ratio}%
              </span>
              <Badge variant={score.weak_tie_ratio >= 50 ? "success" : "warning"}>
                {score.weak_tie_ratio >= 50 ? "Good" : "Low"}
              </Badge>
            </div>
            <p className="text-[11px] text-[#2A2A2A] font-body mt-1">Target: &gt;50%</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">Bridge contacts</p>
              <Tooltip content="Contacts in sectors with fewer than 3 peers in your network — they connect you to clusters you can't currently access.">
                <InfoIcon />
              </Tooltip>
            </div>
            <span
              className="text-2xl font-light text-[#F5F0E8]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {score.bridge_count}
            </span>
          </div>
        </div>

        {/* Reach + diversity */}
        <div className="bg-[#161616] p-6 flex flex-col gap-4 justify-center">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">Reach score</p>
              <Tooltip content="Average tie strength × 20. Measures the overall quality of your relationships (not just quantity).">
                <InfoIcon />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {score.reach_score}
              </span>
              <span className="text-xs text-[#4A4640] font-body">/100</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">Diversity</p>
              <Tooltip content="Distinct sectors in your network out of 15 tracked. Higher diversity means more paths to unexpected opportunities.">
                <InfoIcon />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {score.diversity_score}
              </span>
              <span className="text-xs text-[#4A4640] font-body">/100</span>
              {score.diversity_score < 40 && <Badge variant="warning">Low</Badge>}
            </div>
          </div>
        </div>

        {/* Dormant */}
        <div className="bg-[#161616] p-6 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-3">
            <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">Dormant ties</p>
            <Tooltip content="Contacts you haven't spoken to in over 90 days. Dormant ties are the quickest wins — they already know you.">
              <InfoIcon />
            </Tooltip>
          </div>
          <span
            className="text-4xl font-light mb-1"
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              color: score.dormant_count > 0 ? "#C44820" : "#4A8C5C",
            }}
          >
            {score.dormant_count}
          </span>
          <p className="text-[11px] text-[#4A4640] font-body mb-4">
            relationship{score.dormant_count !== 1 ? "s" : ""} you haven&apos;t activated
          </p>
          {score.dormant_count > 0 && (
            <Link href="/playbook">
              <Button variant="primary" size="sm">Activate now</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Two-column: tabs + recent */}
      <div className="grid grid-cols-5 gap-5">
        {/* Playbook / Recent tabs */}
        <div className="col-span-3">
          {/* Tab bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              {(["playbook", "recent"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`h-7 px-3 rounded-[3px] text-xs font-body font-medium transition-all duration-100 capitalize ${
                    tab === t
                      ? "bg-[#1E1E1E] text-[#F5F0E8]"
                      : "text-[#4A4640] hover:text-[#8A8578]"
                  }`}
                >
                  {t === "playbook" ? "Your Playbook" : "Recently Added"}
                </button>
              ))}
            </div>
            <Link
              href={tab === "playbook" ? "/playbook" : "/contacts"}
              className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors"
            >
              View all →
            </Link>
          </div>

          {tab === "playbook" && (
            <div className="mb-2">
              <p className="text-[11px] text-[#2A2A2A] font-body leading-relaxed">
                Ranked by opportunity score — dormancy × sector gap × tie strength
              </p>
            </div>
          )}

          <div className="space-y-2">
            {displayList.map((contact) => {
              const tie = classifyTie(contact);
              const days = daysSince(contact.last_contact);
              const rationale =
                tab === "playbook" ? whyThisContact(contact, contacts) : undefined;

              return (
                <Card key={contact.id} hover className="group">
                  <CardContent className="py-3.5 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-[#F5F0E8] font-body">{contact.name}</span>
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: tieClassColors[tie] }}
                          />
                          <span className="text-[10px] text-[#4A4640] font-body capitalize">{tie} tie</span>
                        </div>
                        <p className="text-xs text-[#4A4640] font-body truncate">
                          {[contact.role, contact.organization].filter(Boolean).join(" · ")}
                        </p>
                        {rationale && (
                          <p className="text-[11px] text-[#8A8578] font-body leading-relaxed mt-1.5">
                            {rationale}
                          </p>
                        )}
                        {tab === "recent" && (
                          <p className="text-[11px] text-[#2A2A2A] font-body mt-1">
                            Last contact: <LastStr days={days} />
                          </p>
                        )}
                      </div>
                      {tab === "playbook" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setActContact(contact)}
                        >
                          Act
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-3">
          {/* Tie strength explainer */}
          <Card>
            <CardContent className="py-4 px-4">
              <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-3">
                Tie strength scale
              </p>
              <div className="space-y-2">
                {[
                  { label: "1 — Acquaintance", desc: "Met once, no ongoing contact" },
                  { label: "2 — Weak tie", desc: "Occasional contact, low trust" },
                  { label: "3 — Moderate", desc: "Regular contact, mutual respect" },
                  { label: "4 — Strong tie", desc: "Trusted, reciprocal relationship" },
                  { label: "5 — Core tie", desc: "Deep trust, mutual investment" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <span className="text-[11px] font-medium text-[#8A8578] font-body w-28 shrink-0">{row.label}</span>
                    <span className="text-[11px] text-[#4A4640] font-body leading-tight">{row.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Network graph link */}
          <Link href="/network">
            <Card hover>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8A8578] font-body">View network graph</p>
                  <p className="text-[11px] text-[#4A4640] font-body mt-0.5">
                    {contacts.length} nodes · {score.bridge_count} bridge contacts
                  </p>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="text-[#2A2A2A]">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CardContent>
            </Card>
          </Link>

          {/* Contacts link */}
          <Link href="/contacts">
            <Card hover>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8A8578] font-body">All contacts</p>
                  <p className="text-[11px] text-[#4A4640] font-body mt-0.5">
                    {contacts.length} total · {score.dormant_count} dormant
                  </p>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="text-[#2A2A2A]">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </CardContent>
            </Card>
          </Link>
        </div>
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
