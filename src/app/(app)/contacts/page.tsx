"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Contact, TieType, ConnectionStrength } from "@/types";

const mockContacts: Contact[] = [
  { id: "1", user_id: "u1", name: "Dr. Priya Sharma", role: "Professor of CS", organization: "MIT", industry: "Academia", tags: ["academia", "research", "ml"], tie_type: "bridge", connection_strength: "moderate", social_capital_score: 82, bridging_score: 91, bonding_score: 34, last_contact: "2025-09-15", created_at: "", updated_at: "" },
  { id: "2", user_id: "u1", name: "Marcus Webb", role: "Product Manager", organization: "Figma", industry: "Tech", tags: ["design", "product"], tie_type: "weak", connection_strength: "weak", social_capital_score: 68, bridging_score: 74, bonding_score: 28, last_contact: "2025-11-02", created_at: "", updated_at: "" },
  { id: "3", user_id: "u1", name: "Aisha Patel", role: "MBA Student", organization: "Stanford GSB", industry: "Finance", tags: ["mba", "finance", "consulting"], tie_type: "strong", connection_strength: "strong", social_capital_score: 75, bridging_score: 55, bonding_score: 88, last_contact: "2026-05-10", created_at: "", updated_at: "" },
  { id: "4", user_id: "u1", name: "Lena Torres", role: "Founder", organization: "Stealth (YC W24)", industry: "Startup", tags: ["startup", "founder", "b2b"], tie_type: "weak", connection_strength: "weak", social_capital_score: 61, bridging_score: 66, bonding_score: 30, last_contact: "2026-01-20", created_at: "", updated_at: "" },
  { id: "5", user_id: "u1", name: "James Okafor", role: "SWE Intern", organization: "Stripe", industry: "Tech", tags: ["engineering", "fintech"], tie_type: "strong", connection_strength: "strong", social_capital_score: 72, bridging_score: 50, bonding_score: 85, last_contact: "2026-05-18", created_at: "", updated_at: "" },
  { id: "6", user_id: "u1", name: "Chris Lim", role: "VC Analyst", organization: "Sequoia", industry: "VC", tags: ["vc", "investing", "early-stage"], tie_type: "bridge", connection_strength: "weak", social_capital_score: 88, bridging_score: 95, bonding_score: 20, last_contact: "2025-10-30", created_at: "", updated_at: "" },
  { id: "7", user_id: "u1", name: "Sofia Reyes", role: "Senior Designer", organization: "Apple", industry: "Tech", tags: ["design", "hardware"], tie_type: "weak", connection_strength: "moderate", social_capital_score: 55, bridging_score: 48, bonding_score: 42, last_contact: "2026-03-05", created_at: "", updated_at: "" },
  { id: "8", user_id: "u1", name: "Nate Kim", role: "Quant Researcher", organization: "Two Sigma", industry: "Finance", tags: ["quant", "finance", "ml"], tie_type: "weak", connection_strength: "dormant", social_capital_score: 77, bridging_score: 70, bonding_score: 25, last_contact: "2025-03-12", created_at: "", updated_at: "" },
];

const strengthConfig: Record<ConnectionStrength, { label: string; color: string }> = {
  strong: { label: "Strong", color: "#4A8C5C" },
  moderate: { label: "Moderate", color: "#B8860B" },
  weak: { label: "Weak", color: "#C44820" },
  dormant: { label: "Dormant", color: "#2A2A2A" },
};

const tieLabels: Record<TieType, string> = {
  strong: "Strong",
  weak: "Weak",
  bridge: "Bridge",
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  const industries = ["all", ...Array.from(new Set(mockContacts.map((c) => c.industry || "Other")))];

  const filtered = mockContacts.filter((c) => {
    const matchSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role?.toLowerCase().includes(search.toLowerCase()) ||
      c.organization?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchIndustry = selectedIndustry === "all" || c.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

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
            {mockContacts.length} contacts &middot; {mockContacts.filter((c) => c.connection_strength === "dormant").length} dormant
          </p>
        </div>
        <Button variant="primary" size="sm">+ Add contact</Button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search contacts, roles, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
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

      {/* Table */}
      {filtered.length === 0 ? (
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
              : "Add your first contact to start building your network map."
          }
          action={!search ? <Button variant="primary" size="sm">Add contact</Button> : undefined}
        />
      ) : (
        <Card>
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-[#1F1F1F]">
            <span className="col-span-3 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Name</span>
            <span className="col-span-2 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Role</span>
            <span className="col-span-2 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Organization</span>
            <span className="col-span-2 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Tags</span>
            <span className="col-span-1 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Tie</span>
            <span className="col-span-1 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Score</span>
            <span className="col-span-1 text-[10px] text-[#4A4640] uppercase tracking-widest font-body">Last</span>
          </div>

          <div className="divide-y divide-[#1F1F1F]">
            {filtered.map((c) => {
              const str = strengthConfig[c.connection_strength];
              const lastDate = c.last_contact
                ? new Date(c.last_contact).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "—";

              return (
                <div
                  key={c.id}
                  className="grid grid-cols-12 gap-3 px-5 py-3 hover:bg-[#161616] transition-colors cursor-pointer items-center"
                >
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium text-[#8A8578] font-body">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#F5F0E8] font-body truncate">{c.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[#8A8578] font-body truncate block">{c.role}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[#4A4640] font-body truncate block">{c.organization}</span>
                  </div>
                  <div className="col-span-2 flex gap-1 flex-wrap">
                    {c.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="muted">{tag}</Badge>
                    ))}
                    {c.tags.length > 2 && (
                      <Badge variant="muted">+{c.tags.length - 2}</Badge>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Badge variant={c.tie_type === "bridge" ? "default" : c.tie_type === "strong" ? "success" : "muted"}>
                      {tieLabels[c.tie_type]}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: str.color }}
                    />
                    <span
                      className="text-sm font-light"
                      style={{
                        fontFamily: "Cormorant Garamond, Georgia, serif",
                        color: "#F5F0E8",
                      }}
                    >
                      {c.social_capital_score}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-[#4A4640] font-body">{lastDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
