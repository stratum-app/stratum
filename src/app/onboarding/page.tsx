"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StratumMark } from "@/components/ui/stratum-mark";
import { cn } from "@/lib/utils";
import { upsertContact, saveProfile, parseLinkedInCSV } from "@/lib/contacts-store";
import { classifyTie } from "@/lib/scoring";
import type { Contact, RelationshipType } from "@/types";

type Goal = "internship" | "college" | "job" | "networking";
type Sector = "Tech" | "Finance" | "Academia" | "Healthcare" | "Startup" | "Government" | "Design" | "Legal" | "Other";

interface ManualContact {
  name: string;
  relationship: string;
  relationship_type: RelationshipType;
  sector: Sector | "";
  tie_strength: number;
}

const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: "internship", label: "Land an internship", description: "Looking for summer or co-op opportunities" },
  { value: "college", label: "Get into college", description: "Need letters of rec and advisor relationships" },
  { value: "job", label: "Find a full-time job", description: "Graduating or switching careers" },
  { value: "networking", label: "Build my network", description: "Grow connections for the long term" },
];

const SECTORS: Sector[] = ["Tech", "Finance", "Academia", "Healthcare", "Startup", "Government", "Design", "Legal", "Other"];
const REL_TYPES: { value: RelationshipType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "mentor", label: "Mentor" },
  { value: "teacher", label: "Teacher / Professor" },
  { value: "classmate", label: "Classmate" },
  { value: "friend", label: "Friend" },
  { value: "acquaintance", label: "Acquaintance" },
  { value: "colleague", label: "Colleague" },
  { value: "family", label: "Family" },
];

const strengthColors = { 1: "#C44820", 2: "#C44820", 3: "#B8860B", 4: "#4A8C5C", 5: "#4A8C5C" };

const TOTAL_STEPS = 4;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i < current ? "w-6 h-1.5 bg-[#C44820]" : i === current ? "w-6 h-1.5 bg-[#F5F0E8]" : "w-3 h-1.5 bg-[#2A2A2A]"
          )}
        />
      ))}
    </div>
  );
}

function StrengthPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "w-6 h-6 rounded-[3px] text-[11px] font-medium font-body transition-all duration-100 border",
            value >= v
              ? "text-[#F5F0E8] border-transparent"
              : "bg-transparent text-[#2A2A2A] border-[#1F1F1F] hover:border-[#2A2A2A]"
          )}
          style={value >= v ? { backgroundColor: strengthColors[v as keyof typeof strengthColors] } : {}}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function MiniGraph({ contacts }: { contacts: ManualContact[] }) {
  const cx = 200; const cy = 155; const r = 90;
  const filled = contacts.filter((c) => c.name.trim());
  const positions = filled.map((_, i) => ({
    x: cx + r * Math.cos((2 * Math.PI * i) / Math.max(filled.length, 1) - Math.PI / 2),
    y: cy + r * Math.sin((2 * Math.PI * i) / Math.max(filled.length, 1) - Math.PI / 2),
  }));

  return (
    <svg width="400" height="310" viewBox="0 0 400 310" className="mx-auto">
      <circle cx={cx} cy={cy} r={14} fill="#C44820" fillOpacity={0.2} stroke="#C44820" strokeWidth={1.5} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#F5F0E8" fontSize={9} fontFamily="DM Sans,sans-serif">You</text>
      {positions.map((pos, i) => {
        const c = filled[i];
        const color = strengthColors[c.tie_strength as keyof typeof strengthColors] ?? "#888";
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke={color} strokeWidth={1} strokeOpacity={0.4} strokeDasharray={c.tie_strength <= 2 ? "4 3" : undefined} />
            <circle cx={pos.x} cy={pos.y} r={9 + c.tie_strength * 1.5} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} />
            <text x={pos.x} y={pos.y + 22} textAnchor="middle" fill="#8A8578" fontSize={9} fontFamily="DM Sans,sans-serif">{c.name.split(" ")[0]}</text>
            {c.sector && <text x={pos.x} y={pos.y + 33} textAnchor="middle" fill="#4A4640" fontSize={8} fontFamily="DM Sans,sans-serif">{c.sector}</text>}
          </g>
        );
      })}
      {Array.from({ length: 3 - filled.length }).map((_, i) => {
        const idx = filled.length + i;
        const pos = { x: cx + r * Math.cos((2 * Math.PI * idx) / 3 - Math.PI / 2), y: cy + r * Math.sin((2 * Math.PI * idx) / 3 - Math.PI / 2) };
        return (
          <g key={`e-${i}`}>
            <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke="#1E1E1E" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={pos.x} cy={pos.y} r={10} fill="none" stroke="#2A2A2A" strokeWidth={1} strokeDasharray="3 3" />
          </g>
        );
      })}
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<Goal | null>(null);

  // LinkedIn import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvParsed, setCsvParsed] = useState<Partial<Contact>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const [csvImported, setCsvImported] = useState(false);
  // Tie-strength review for imported contacts
  const [importStrengths, setImportStrengths] = useState<number[]>([]);

  // Manual contacts state
  const [manualContacts, setManualContacts] = useState<ManualContact[]>([
    { name: "", relationship: "", relationship_type: "professional", sector: "", tie_strength: 3 },
    { name: "", relationship: "", relationship_type: "professional", sector: "", tie_strength: 3 },
    { name: "", relationship: "", relationship_type: "professional", sector: "", tie_strength: 3 },
  ]);

  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseLinkedInCSV(text);
      if (!parsed.length) {
        setCsvError("Couldn't find any connections in this file. Make sure you downloaded the Connections CSV from LinkedIn.");
        return;
      }
      setCsvParsed(parsed);
      setImportStrengths(parsed.map(() => 3));
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    csvParsed.forEach((c, i) => {
      const contact: Contact = {
        id: crypto.randomUUID(),
        user_id: "local",
        name: c.name ?? "Unknown",
        email: c.email,
        role: c.role,
        organization: c.organization,
        industry: c.industry ?? "Other",
        tags: [],
        last_contact: c.last_contact,
        tie_strength: importStrengths[i] ?? 3,
        relationship_type: "professional",
        connection_strength: "moderate",
        social_capital_score: 0,
        bridging_score: 0,
        bonding_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      upsertContact(contact);
    });
    setCsvImported(true);
    setStep(3); // skip manual entry, go to graph preview
  }

  function updateManual(idx: number, field: keyof ManualContact, value: string | number) {
    setManualContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  function canProceedStep0() {
    return name.trim().length > 0 && goal !== null;
  }

  function canProceedManual() {
    return manualContacts.filter((c) => c.name.trim()).length >= 1;
  }

  function saveManualAndContinue() {
    manualContacts.filter((c) => c.name.trim()).forEach((c) => {
      const contact: Contact = {
        id: crypto.randomUUID(),
        user_id: "local",
        name: c.name,
        role: c.relationship || undefined,
        industry: c.sector || "Other",
        tags: [],
        last_contact: new Date().toISOString().split("T")[0],
        tie_strength: c.tie_strength,
        relationship_type: c.relationship_type,
        connection_strength: "moderate",
        social_capital_score: 0,
        bridging_score: 0,
        bonding_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      upsertContact(contact);
    });
    setStep(3);
  }

  async function finish() {
    setSaving(true);
    saveProfile({ name, goal: goal ?? "networking" });
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  const displayContacts = manualContacts.filter((c) => c.name.trim());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 flex justify-center">
        <StratumMark size={28} />
      </div>

      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <StepIndicator current={step} />
          <span className="text-xs text-[#4A4640] font-body">Step {step + 1} of {TOTAL_STEPS}</span>
        </div>

        {/* ── Step 0: Welcome + goal ─────────────────────────────────── */}
        {step === 0 && (
          <div className="animate-fade-up space-y-6">
            <div>
              <h1 className="text-4xl font-light text-[#F5F0E8] mb-2 leading-snug" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                Welcome to Stratum.<br />Let&apos;s map your network.
              </h1>
              <p className="text-sm text-[#4A4640] font-body">A few questions to calibrate your network score.</p>
            </div>

            <Input
              label="What should we call you?"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div>
              <p className="text-xs font-medium text-[#8A8578] tracking-wider uppercase mb-2.5">What are you working toward?</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={cn(
                      "text-left p-3.5 rounded-[4px] border transition-all duration-150",
                      goal === g.value
                        ? "bg-[#7A2C14]/20 border-[#C44820]/50 text-[#F5F0E8]"
                        : "bg-[#161616] border-[#1F1F1F] text-[#4A4640] hover:border-[#2A2A2A] hover:text-[#8A8578]"
                    )}
                  >
                    <p className="text-xs font-medium font-body mb-0.5">{g.label}</p>
                    <p className="text-[11px] font-body leading-snug opacity-70">{g.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="md" disabled={!canProceedStep0()} onClick={() => setStep(1)}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 1: LinkedIn CSV import ────────────────────────────── */}
        {step === 1 && (
          <div className="animate-fade-up space-y-5">
            <div>
              <h2 className="text-3xl font-light text-[#F5F0E8] mb-2" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                Import from LinkedIn.
              </h2>
              <p className="text-sm text-[#4A4640] font-body">The fastest way to seed your network. Completely private — nothing is sent to LinkedIn.</p>
            </div>

            {/* Direct link CTA */}
            <div className="flex items-center justify-between bg-[#161616] border border-[#1F1F1F] rounded-[6px] px-4 py-3">
              <div>
                <p className="text-xs font-medium text-[#F5F0E8] font-body">Open LinkedIn Data Export</p>
                <p className="text-[11px] text-[#4A4640] font-body mt-0.5">Opens in a new tab — come back here when you have the file</p>
              </div>
              <a
                href="https://www.linkedin.com/mypreferences/d/download-my-data"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  Go to LinkedIn →
                </Button>
              </a>
            </div>

            {/* Step-by-step instructions */}
            <div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-4">
              <p className="text-[10px] font-medium text-[#8A8578] uppercase tracking-widest font-body mb-4">
                How to get your Connections.csv
              </p>
              <div className="space-y-3">
                {[
                  {
                    step: "Go to linkedin.com → click your profile picture → Settings & Privacy",
                    note: null,
                  },
                  {
                    step: 'Click "Data Privacy" in the left menu',
                    note: null,
                  },
                  {
                    step: 'Click "Get a copy of your data"',
                    note: null,
                  },
                  {
                    step: "Select the option for the full archive — not the quick options at the top",
                    note: "Connections is only available in the full archive, not the preselected quick options.",
                  },
                  {
                    step: 'Click "Request archive"',
                    note: null,
                  },
                  {
                    step: "LinkedIn will email you within 10 minutes to 48 hours",
                    note: null,
                  },
                  {
                    step: 'Download the ZIP from the email, unzip it, and find "Connections.csv" inside',
                    note: null,
                  },
                  {
                    step: "Upload that CSV file below",
                    note: null,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5"
                      style={{ backgroundColor: "#1E1E1E", border: "1px solid #2A2A2A", color: "#C44820" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs text-[#8A8578] font-body leading-relaxed">{item.step}</p>
                      {item.note && (
                        <p className="text-[11px] text-[#4A4640] font-body mt-0.5 leading-relaxed">
                          ↳ {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Wait time note */}
              <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center gap-2">
                <svg width="12" height="12" fill="none" viewBox="0 0 12 12" className="text-[#4A4640] shrink-0">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M6 3.5v3l2 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[11px] text-[#4A4640] font-body leading-relaxed">
                  LinkedIn typically delivers your archive within 10–30 minutes. We&apos;ll be here when it arrives.
                </p>
              </div>
            </div>

            {/* Upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border border-dashed rounded-[6px] p-8 text-center cursor-pointer transition-all duration-150",
                csvParsed.length ? "border-[#4A8C5C]/50 bg-[#4A8C5C]/05" : "border-[#2A2A2A] hover:border-[#4A4640] bg-[#161616]"
              )}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              {csvParsed.length > 0 ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-[#4A8C5C]/15 border border-[#4A8C5C]/30 flex items-center justify-center mx-auto mb-3">
                    <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2.5 7l3 3 6-6" stroke="#4A8C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <p className="text-sm font-medium text-[#4A8C5C] font-body">{csvParsed.length} connections found</p>
                  <p className="text-xs text-[#4A4640] font-body mt-1">{csvFileName}</p>
                </>
              ) : (
                <>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="mx-auto mb-3 text-[#2A2A2A]">
                    <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.25" />
                  </svg>
                  <p className="text-sm text-[#8A8578] font-body">Click to upload Connections.csv</p>
                  <p className="text-xs text-[#4A4640] font-body mt-1">CSV file · exported from LinkedIn</p>
                </>
              )}
            </div>

            {csvError && <p className="text-xs text-red-400 font-body">{csvError}</p>}

            {/* Preview table */}
            {csvParsed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#8A8578] uppercase tracking-widest font-body mb-2">
                  Preview — first 5 of {csvParsed.length}
                </p>
                <div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] divide-y divide-[#1F1F1F]">
                  {csvParsed.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-medium text-[#8A8578] font-body">
                          {(c.name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#F5F0E8] font-body truncate">{c.name}</p>
                        <p className="text-[10px] text-[#4A4640] font-body truncate">{[c.role, c.organization].filter(Boolean).join(" · ")}</p>
                      </div>
                      <span className="text-[10px] bg-[#1E1E1E] border border-[#2A2A2A] text-[#8A8578] px-1.5 py-0.5 rounded-[3px] font-body shrink-0">
                        {c.industry ?? "Other"}
                      </span>
                    </div>
                  ))}
                  {csvParsed.length > 5 && (
                    <div className="px-4 py-2 text-center">
                      <p className="text-[10px] text-[#4A4640] font-body">+ {csvParsed.length - 5} more</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fallback: don't have CSV yet */}
            <div className="flex items-center gap-2 pt-1 pb-0.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12" className="text-[#2A2A2A] shrink-0">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M6 5v4M6 3.5v.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              <p className="text-[11px] text-[#4A4640] font-body">
                Don&apos;t have your CSV yet?{" "}
                <button
                  onClick={() => setStep(2)}
                  className="text-[#8A8578] hover:text-[#F5F0E8] underline underline-offset-2 transition-colors"
                >
                  Add connections manually →
                </button>{" "}
                and come back to import later.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button onClick={() => setStep(0)} className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors">← Back</button>
              {csvParsed.length > 0 && (
                <Button variant="primary" size="md" onClick={() => setStep(1.5 as unknown as number)}>
                  Review & import {csvParsed.length} →
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1.5: Adjust tie strengths for LinkedIn imports ─────── */}
        {(step as number) === 1.5 && (
          <div className="animate-fade-up space-y-4">
            <div>
              <h2 className="text-3xl font-light text-[#F5F0E8] mb-2" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                Rate your relationships.
              </h2>
              <p className="text-sm text-[#4A4640] font-body">
                How close are you to these people? This calibrates your capital score.
              </p>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {csvParsed.map((c, i) => (
                <div key={i} className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F5F0E8] font-body truncate">{c.name}</p>
                    <p className="text-[10px] text-[#4A4640] font-body truncate">{c.role ?? ""}{c.organization ? ` · ${c.organization}` : ""}</p>
                  </div>
                  <StrengthPicker
                    value={importStrengths[i] ?? 3}
                    onChange={(v) => setImportStrengths((prev) => prev.map((s, j) => (j === i ? v : s)))}
                  />
                </div>
              ))}
            </div>

            <div className="bg-[#161616] border border-[#1F1F1F] rounded-[4px] px-3 py-2.5">
              <p className="text-[11px] text-[#4A4640] font-body">
                <span className="text-[#8A8578]">1–2</span> = barely know them &nbsp;·&nbsp;
                <span className="text-[#8A8578]">3</span> = occasional contact &nbsp;·&nbsp;
                <span className="text-[#8A8578]">4–5</span> = regular, close relationship
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors">← Back</button>
              <Button variant="primary" size="md" onClick={confirmImport}>
                Import {csvParsed.length} connections →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Manual entry ───────────────────────────────────── */}
        {step === 2 && (
          <div className="animate-fade-up space-y-4">
            <div>
              <h2 className="text-3xl font-light text-[#F5F0E8] mb-2" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                Add your first connections.
              </h2>
              <p className="text-sm text-[#4A4640] font-body">
                Think of people already in your orbit — a professor, classmate, alumni. At least one to continue.
              </p>
            </div>

            {manualContacts.map((c, idx) => (
              <div key={idx} className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-4 space-y-3">
                <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">Connection {idx + 1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Full name" value={c.name} onChange={(e) => updateManual(idx, "name", e.target.value)} />
                  <div>
                    <select
                      value={c.relationship_type}
                      onChange={(e) => updateManual(idx, "relationship_type", e.target.value)}
                      className="h-9 w-full rounded-[4px] bg-[#161616] border border-[#2A2A2A] px-3 text-sm text-[#F5F0E8] font-body focus:outline-none focus:border-[#C44820] transition-colors"
                    >
                      {REL_TYPES.map((r) => (
                        <option key={r.value} value={r.value} className="bg-[#1E1E1E]">{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateManual(idx, "sector", c.sector === s ? "" : s)}
                      className={cn(
                        "px-2 py-0.5 rounded-[3px] text-[10px] font-body border transition-all duration-100",
                        c.sector === s
                          ? "bg-[#1E1E1E] border-[#2A2A2A] text-[#F5F0E8]"
                          : "bg-transparent border-[#1F1F1F] text-[#4A4640] hover:border-[#2A2A2A] hover:text-[#8A8578]"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Tie strength</p>
                  <StrengthPicker value={c.tie_strength} onChange={(v) => updateManual(idx, "tie_strength", v)} />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors">← Back</button>
              <Button variant="primary" size="md" disabled={!canProceedManual()} onClick={saveManualAndContinue}>
                See my network →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Mini graph + done ──────────────────────────────── */}
        {step === 3 && (
          <div className="animate-fade-up text-center space-y-6">
            <div>
              <h2 className="text-3xl font-light text-[#F5F0E8] mb-2" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                Your network is taking shape.
              </h2>
              <p className="text-sm text-[#4A4640] font-body">
                {csvImported
                  ? `${csvParsed.length} connections imported. Every one moves your capital score.`
                  : "Every connection you add deepens the map."}
              </p>
            </div>

            <div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] py-8 px-4">
              {csvImported ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#4A8C5C]/15 border border-[#4A8C5C]/30 flex items-center justify-center mx-auto">
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 10l4 4 8-8" stroke="#4A8C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <p className="text-2xl font-light text-[#F5F0E8]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                    {csvParsed.length} connections imported
                  </p>
                  <p className="text-sm text-[#4A4640] font-body">
                    {new Set(csvParsed.map((c) => c.industry).filter(Boolean)).size} sectors &nbsp;·&nbsp;
                    {csvParsed.filter((c) => c.organization).length} organizations
                  </p>
                </div>
              ) : (
                <>
                  <MiniGraph contacts={displayContacts} />
                  <div className="flex items-center justify-center gap-5 mt-2">
                    {([1, 3, 5] as const).map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: strengthColors[s] }} />
                        <span className="text-[11px] text-[#4A4640] font-body">
                          {s <= 2 ? "Weak" : s <= 3 ? "Medium" : "Strong"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(csvImported ? 1.5 as unknown as number : 2)}
                className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors"
              >
                ← Edit
              </button>
              <Button variant="primary" size="lg" loading={saving} onClick={finish}>
                Go to my dashboard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
