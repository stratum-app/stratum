"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  classifyTie,
  daysSince,
  outreachChannel,
  whyThisContact,
} from "@/lib/scoring";
import {
  getProfile,
  isAiLimitReached,
  incrementAiUsage,
  getAiUsage,
  FREE_AI_MONTHLY_LIMIT,
} from "@/lib/contacts-store";
import type { Contact, OutreachTone } from "@/types";

interface ActPanelProps {
  contact: Contact | null;
  allContacts: Contact[];
  onClose: () => void;
}

const tieClassColors = { strong: "#4A8C5C", medium: "#B8860B", weak: "#C44820" };
const tieClassLabels = { strong: "Strong tie", medium: "Medium tie", weak: "Weak tie" };

const TONES: { value: OutreachTone; label: string; desc: string }[] = [
  { value: "formal",       label: "Formal",       desc: "Academic / official" },
  { value: "professional", label: "Professional", desc: "Business standard" },
  { value: "casual",       label: "Casual",       desc: "Warm, approachable" },
  { value: "friendly",     label: "Friendly",     desc: "Close, personal" },
];

function CopyIcon() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
      <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M9 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v5a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 13 13">
      <path d="M1.5 4.5h2v7h-2v-7zm1-3a1 1 0 110 2 1 1 0 010-2zm3.5 3h1.9v.96h.03c.27-.5.92-1.02 1.89-1.02 2.02 0 2.39 1.33 2.39 3.06V11.5h-2v-2.6c0-.62-.01-1.42-.87-1.42-.87 0-1 .68-1 1.37v2.65h-2v-7z" />
    </svg>
  );
}

export function ActPanel({ contact, allContacts, onClose }: ActPanelProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<OutreachTone>("professional");
  const [limitReached, setLimitReached] = useState(false);

  const generateMessage = useCallback(async (c: Contact, selectedTone: OutreachTone) => {
    if (isAiLimitReached()) {
      setLimitReached(true);
      return;
    }
    setLimitReached(false);
    setLoading(true);
    setError(null);
    setMessage("");
    const profile = getProfile();

    try {
      const res = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: c, userGoal: profile?.goal, tone: selectedTone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      incrementAiUsage();
      setMessage(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate message");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contact) {
      setMessage("");
      setError(null);
      setCopied(false);
      setLimitReached(isAiLimitReached());
    }
  }, [contact]);

  async function copyMessage() {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const usage = getAiUsage();
  const usageThisMonth = (() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${now.getMonth()}`;
    return usage.month === month ? usage.count : 0;
  })();

  return (
    <AnimatePresence>
      {contact && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.8 }}
            className="fixed right-0 top-0 h-full w-[400px] z-50 bg-[#161616] border-l border-[#2A2A2A] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#1F1F1F]">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-xl font-light text-[#F5F0E8] leading-tight"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {contact.name}
                </h3>
                <p className="text-xs text-[#8A8578] font-body mt-0.5">
                  {[contact.role, contact.organization].filter(Boolean).join(" · ")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {(() => {
                    const tie = classifyTie(contact);
                    return (
                      <Badge variant={tie === "strong" ? "success" : tie === "weak" ? "accent" : "warning"}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tieClassColors[tie] }} />
                        {tieClassLabels[tie]}
                      </Badge>
                    );
                  })()}
                  {contact.industry && <Badge variant="muted">{contact.industry}</Badge>}
                </div>
              </div>
              <button onClick={onClose} className="text-[#4A4640] hover:text-[#8A8578] transition-colors p-1 -mt-0.5">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Why */}
              <div>
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Why now</p>
                <div className="bg-[#1E1E1E] rounded-[4px] p-3 border border-[#2A2A2A]">
                  <p className="text-xs text-[#8A8578] font-body leading-relaxed">
                    {whyThisContact(contact, allContacts)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1E1E1E] rounded-[4px] p-2.5 text-center">
                  <p className="text-lg font-light text-[#F5F0E8]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                    {contact.tie_strength}/5
                  </p>
                  <p className="text-[9px] text-[#4A4640] uppercase tracking-widest font-body">Strength</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-[4px] p-2.5 text-center">
                  <p className="text-lg font-light text-[#F5F0E8]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                    {(() => {
                      const d = daysSince(contact.last_contact);
                      return d === Infinity ? "—" : d > 365 ? `${Math.floor(d / 365)}y` : d > 30 ? `${Math.floor(d / 30)}mo` : `${d}d`;
                    })()}
                  </p>
                  <p className="text-[9px] text-[#4A4640] uppercase tracking-widest font-body">Since contact</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-[4px] p-2.5 text-center">
                  <p className="text-lg font-light text-[#F5F0E8]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                    {contact.relationship_score ?? contact.social_capital_score}
                  </p>
                  <p className="text-[9px] text-[#4A4640] uppercase tracking-widest font-body">Score</p>
                </div>
              </div>

              {/* Score explanation */}
              {contact.score_explanation && (
                <p className="text-[11px] text-[#4A4640] font-body">{contact.score_explanation}</p>
              )}

              {/* Outreach channel */}
              {(() => {
                const ch = outreachChannel(contact);
                return (
                  <div>
                    <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Recommended channel</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#F5F0E8] font-body bg-[#1E1E1E] border border-[#2A2A2A] px-2.5 py-1 rounded-[4px]">
                        {ch.primary}
                      </span>
                      {ch.secondary && (
                        <>
                          <span className="text-[#2A2A2A] text-xs font-body">then</span>
                          <span className="text-xs text-[#4A4640] font-body">{ch.secondary}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Tone selector */}
              <div>
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Message tone</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      title={t.desc}
                      className={cn(
                        "py-1.5 px-2 rounded-[4px] text-[11px] font-body font-medium border transition-all duration-100",
                        tone === t.value
                          ? "bg-[#1E1E1E] border-[#C44820]/40 text-[#F5F0E8]"
                          : "bg-transparent border-[#1F1F1F] text-[#4A4640] hover:border-[#2A2A2A] hover:text-[#8A8578]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body">AI outreach message</p>
                  {!limitReached && (
                    <button
                      onClick={() => generateMessage(contact, tone)}
                      disabled={loading}
                      className="text-[10px] text-[#4A4640] hover:text-[#8A8578] font-body transition-colors disabled:opacity-40"
                    >
                      Regenerate ↺
                    </button>
                  )}
                </div>

                {/* Usage meter */}
                <div className="flex items-center gap-1.5 mb-2">
                  {[...Array(FREE_AI_MONTHLY_LIMIT)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      style={{ backgroundColor: i < usageThisMonth ? "#C44820" : "#2A2A2A" }}
                    />
                  ))}
                  <span className="text-[10px] text-[#4A4640] font-body shrink-0">
                    {usageThisMonth}/{FREE_AI_MONTHLY_LIMIT} free
                  </span>
                </div>

                <div className="bg-[#1E1E1E] rounded-[4px] border border-[#2A2A2A] min-h-[100px] relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 bg-[#C44820] rounded-full"
                            style={{ animation: "pulse-dot 1.2s ease infinite", animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {limitReached && !loading && (
                    <div className="p-3.5 text-center">
                      <p className="text-xs text-[#8A8578] font-body mb-3">
                        You&apos;ve used your {FREE_AI_MONTHLY_LIMIT} free messages this month.
                      </p>
                      <Button variant="primary" size="sm" onClick={() => window.location.href = "/pricing"}>
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                  {error && !loading && !limitReached && (
                    <div className="p-3.5">
                      <p className="text-xs text-red-400 font-body">{error}</p>
                    </div>
                  )}
                  {message && !loading && (
                    <p className="p-3.5 text-xs text-[#F5F0E8] font-body leading-relaxed italic">
                      &ldquo;{message}&rdquo;
                    </p>
                  )}
                  {!message && !loading && !error && !limitReached && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => generateMessage(contact, tone)}
                        className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors flex items-center gap-1.5"
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Generate message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-[#1F1F1F] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  onClick={copyMessage}
                  disabled={!message || loading}
                >
                  {copied ? "Copied!" : <><CopyIcon />Copy message</>}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    const ch = outreachChannel(contact);
                    // Use stored linkedin_url if available; else search is clearly labelled
                    const href = contact.linkedin_url
                      ? contact.linkedin_url
                      : ch.primaryHref?.(contact);
                    if (href) window.open(href, "_blank", "noopener");
                  }}
                >
                  <LinkedInIcon />
                  {contact.linkedin_url ? "Open LinkedIn" : "Search LinkedIn"}
                </Button>
              </div>
              {contact.email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`mailto:${contact.email}`, "_blank")}
                >
                  Send email
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
