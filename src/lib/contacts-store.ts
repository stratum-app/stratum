"use client";

import { useState, useEffect, useCallback } from "react";
import type { Contact } from "@/types";
import { classifyTie, isDormant, relationshipScore, scoreExplanation } from "@/lib/scoring";

const KEY = "stratum_contacts_v1";
const PROFILE_KEY = "stratum_profile_v1";
const AI_USAGE_KEY = "stratum_ai_usage_v1";

// ── Freemium limits ───────────────────────────────────────────────────────────
export const FREE_CONTACT_LIMIT = 25;
export const FREE_AI_MONTHLY_LIMIT = 3;

export interface AiUsage { count: number; month: string }

export function getAiUsage(): AiUsage {
  if (typeof window === "undefined") return { count: 0, month: "" };
  try {
    return JSON.parse(localStorage.getItem(AI_USAGE_KEY) ?? "null") ?? { count: 0, month: "" };
  } catch { return { count: 0, month: "" }; }
}

export function incrementAiUsage(): void {
  const now = new Date();
  const month = `${now.getFullYear()}-${now.getMonth()}`;
  const usage = getAiUsage();
  const fresh = usage.month !== month ? { count: 0, month } : usage;
  localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ count: fresh.count + 1, month }));
}

export function isAiLimitReached(): boolean {
  const now = new Date();
  const month = `${now.getFullYear()}-${now.getMonth()}`;
  const usage = getAiUsage();
  if (usage.month !== month) return false;
  return usage.count >= FREE_AI_MONTHLY_LIMIT;
}

// ── Contacts CRUD ─────────────────────────────────────────────────────────────
export function getRawContacts(): Contact[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Contact[];
  } catch { return []; }
}

export function saveRawContacts(contacts: Contact[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(contacts));
  window.dispatchEvent(new Event("stratum:contacts-updated"));
}

export function upsertContact(contact: Contact): void {
  const all = getRawContacts();
  const idx = all.findIndex((c) => c.id === contact.id);
  if (idx >= 0) {
    all[idx] = { ...contact, updated_at: new Date().toISOString() };
  } else {
    // Enforce free tier limit
    if (all.length >= FREE_CONTACT_LIMIT) {
      window.dispatchEvent(new CustomEvent("stratum:limit-reached", { detail: "contacts" }));
      return;
    }
    all.push({ ...contact, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
  saveRawContacts(all);
}

export function deleteContact(id: string): void {
  saveRawContacts(getRawContacts().filter((c) => c.id !== id));
}

export function deriveContact(c: Contact, allRaw?: Contact[]): Contact {
  const all = allRaw ?? getRawContacts();
  const tie = classifyTie(c);
  const dormant = isDormant(c);
  const rScore = relationshipScore(c, all);
  const explanation = scoreExplanation(c, all);

  return {
    ...c,
    connection_strength: dormant
      ? "dormant"
      : tie === "strong"
      ? "strong"
      : tie === "weak"
      ? "weak"
      : "moderate",
    social_capital_score: rScore,
    relationship_score: rScore,
    score_explanation: explanation,
    bridging_score: (() => {
      const counts = new Map<string, number>();
      all.forEach((x) => {
        if (x.industry) counts.set(x.industry, (counts.get(x.industry) ?? 0) + 1);
      });
      return c.industry && (counts.get(c.industry) ?? 0) < 3 ? 80 : 30;
    })(),
    bonding_score: Math.round(c.tie_strength * 15),
  };
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const reload = useCallback(() => {
    const raw = getRawContacts();
    setContacts(raw.map((c) => deriveContact(c, raw)));
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener("stratum:contacts-updated", reload);
    return () => window.removeEventListener("stratum:contacts-updated", reload);
  }, [reload]);

  return { contacts, reload };
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface UserGoalProfile {
  name: string;
  goal: string;
}

export function getProfile(): UserGoalProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null");
  } catch { return null; }
}

export function saveProfile(profile: UserGoalProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ── LinkedIn CSV parser ───────────────────────────────────────────────────────
export function parseLinkedInCSV(text: string): Partial<Contact>[] {
  const lines = text.split(/\r?\n/);
  const headerIdx = lines.findIndex((l) => l.toLowerCase().includes("first name"));
  if (headerIdx === -1) return [];

  const header = lines[headerIdx]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

  const col = (row: string[], name: string) => {
    const idx = header.indexOf(name);
    return idx >= 0 ? (row[idx] ?? "").replace(/^"|"$/g, "").trim() : "";
  };

  const results: Partial<Contact>[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row =
      line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((v) =>
        v.replace(/^"|"$/g, "").trim()
      ) ?? line.split(",");

    const firstName = col(row, "first name");
    const lastName = col(row, "last name");
    const name = `${firstName} ${lastName}`.trim();
    if (!name) continue;

    const company = col(row, "company");
    const position = col(row, "position");
    const email = col(row, "email address");
    const connectedOn = col(row, "connected on");
    // LinkedIn exports don't include profile URLs in basic CSV
    // linkedin_url remains undefined until user adds it manually

    let last_contact: string | undefined;
    if (connectedOn) {
      const parsed = new Date(connectedOn);
      if (!isNaN(parsed.getTime())) {
        last_contact = parsed.toISOString().split("T")[0];
      }
    }

    results.push({
      name,
      email: email || undefined,
      role: position || undefined,
      organization: company || undefined,
      industry: mapPositionToIndustry(position, company),
      last_contact: last_contact ?? new Date().toISOString().split("T")[0],
      tie_strength: 3,
      relationship_type: "professional",
      tags: [],
      connection_strength: "moderate",
      social_capital_score: 0,
      bridging_score: 0,
      bonding_score: 0,
    });
  }

  return results;
}

function mapPositionToIndustry(position: string, company: string): string {
  const text = `${position} ${company}`.toLowerCase();
  if (/software|engineer|developer|tech|data|ml|ai|product/.test(text)) return "Tech";
  if (/finance|bank|invest|capital|fund|trading/.test(text)) return "Finance";
  if (/professor|research|university|phd|postdoc|faculty|academic/.test(text)) return "Academia";
  if (/doctor|medical|hospital|health|pharma|clinic/.test(text)) return "Healthcare";
  if (/founder|startup|ceo|co-founder|entrepreneur/.test(text)) return "Startup";
  if (/lawyer|legal|attorney|law/.test(text)) return "Legal";
  if (/design|ux|creative|art|media/.test(text)) return "Design";
  if (/government|policy|public|federal|state/.test(text)) return "Government";
  return "Other";
}
