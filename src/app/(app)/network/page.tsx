"use client";

import { useState } from "react";
import { NetworkGraph } from "@/components/network/network-graph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact, TieType, ConnectionStrength } from "@/types";

const mockContacts: Contact[] = [
  { id: "1", user_id: "u1", name: "Dr. Priya Sharma", role: "Professor of CS", organization: "MIT", industry: "Academia", tags: ["academia", "research"], tie_type: "bridge", connection_strength: "moderate", social_capital_score: 82, bridging_score: 91, bonding_score: 34, created_at: "", updated_at: "" },
  { id: "2", user_id: "u1", name: "Marcus Webb", role: "Product Manager", organization: "Figma", industry: "Tech", tags: ["design", "product"], tie_type: "weak", connection_strength: "weak", social_capital_score: 68, bridging_score: 74, bonding_score: 28, created_at: "", updated_at: "" },
  { id: "3", user_id: "u1", name: "Aisha Patel", role: "MBA Student", organization: "Stanford", industry: "Finance", tags: ["mba", "finance"], tie_type: "strong", connection_strength: "strong", social_capital_score: 75, bridging_score: 55, bonding_score: 88, created_at: "", updated_at: "" },
  { id: "4", user_id: "u1", name: "Lena Torres", role: "Founder", organization: "Stealth", industry: "Startup", tags: ["startup", "founder"], tie_type: "weak", connection_strength: "weak", social_capital_score: 61, bridging_score: 66, bonding_score: 30, created_at: "", updated_at: "" },
  { id: "5", user_id: "u1", name: "James Okafor", role: "SWE Intern", organization: "Stripe", industry: "Tech", tags: ["engineering", "fintech"], tie_type: "strong", connection_strength: "strong", social_capital_score: 72, bridging_score: 50, bonding_score: 85, created_at: "", updated_at: "" },
  { id: "6", user_id: "u1", name: "Chris Lim", role: "VC Analyst", organization: "Sequoia", industry: "VC", tags: ["vc", "investing"], tie_type: "bridge", connection_strength: "weak", social_capital_score: 88, bridging_score: 95, bonding_score: 20, created_at: "", updated_at: "" },
  { id: "7", user_id: "u1", name: "Sofia Reyes", role: "Designer", organization: "Apple", industry: "Tech", tags: ["design"], tie_type: "weak", connection_strength: "moderate", social_capital_score: 55, bridging_score: 48, bonding_score: 42, created_at: "", updated_at: "" },
  { id: "8", user_id: "u1", name: "Nate Kim", role: "Quant Researcher", organization: "Two Sigma", industry: "Finance", tags: ["quant", "finance"], tie_type: "weak", connection_strength: "dormant", social_capital_score: 77, bridging_score: 70, bonding_score: 25, created_at: "", updated_at: "" },
  { id: "9", user_id: "u1", name: "Prof. Alan Grant", role: "Associate Professor", organization: "Harvard", industry: "Academia", tags: ["research", "academia"], tie_type: "bridge", connection_strength: "moderate", social_capital_score: 84, bridging_score: 88, bonding_score: 40, created_at: "", updated_at: "" },
  { id: "10", user_id: "u1", name: "Maya Singh", role: "PM", organization: "Google", industry: "Tech", tags: ["product", "tech"], tie_type: "weak", connection_strength: "weak", social_capital_score: 66, bridging_score: 62, bonding_score: 35, created_at: "", updated_at: "" },
];

const tieColors: Record<TieType, string> = {
  strong: "#4A8C5C",
  weak: "#C44820",
  bridge: "#4A7AA8",
};

const tieLabels: Record<TieType, string> = {
  strong: "Strong tie",
  weak: "Weak tie",
  bridge: "Bridge",
};

export default function NetworkPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<TieType | "all">("all");

  const filtered = filter === "all" ? mockContacts : mockContacts.filter((c) => c.tie_type === filter);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-5 border-b border-[#1F1F1F] bg-[#0F0F0F] shrink-0">
        <div className="flex items-center gap-1">
          {(["all", "strong", "weak", "bridge"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-6 px-3 rounded-[3px] text-xs font-body font-medium transition-all duration-100 ${
                filter === f
                  ? "bg-[#1E1E1E] text-[#F5F0E8]"
                  : "text-[#4A4640] hover:text-[#8A8578]"
              }`}
            >
              {f === "all" ? "All" : tieLabels[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {(Object.entries(tieColors) as [TieType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-[#4A4640] font-body">{tieLabels[type]}</span>
              </div>
            ))}
          </div>
          <Button variant="primary" size="sm">+ Add contact</Button>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 flex relative">
        <div className="flex-1">
          <NetworkGraph contacts={filtered} onNodeClick={setSelectedContact} />
        </div>

        {/* Contact detail panel */}
        {selectedContact && (
          <div className="w-72 bg-[#161616] border-l border-[#1F1F1F] p-5 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-lg font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {selectedContact.name}
                </h3>
                <p className="text-xs text-[#4A4640] font-body">{selectedContact.role}</p>
                {selectedContact.organization && (
                  <p className="text-xs text-[#4A4640] font-body">{selectedContact.organization}</p>
                )}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1E1E1E] rounded-[4px] p-3">
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1">Capital</p>
                <span
                  className="text-2xl font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {selectedContact.social_capital_score}
                </span>
              </div>
              <div className="bg-[#1E1E1E] rounded-[4px] p-3">
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1">Bridge</p>
                <span
                  className="text-2xl font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {selectedContact.bridging_score}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Tie type</p>
              <Badge
                variant={
                  selectedContact.tie_type === "bridge"
                    ? "default"
                    : selectedContact.tie_type === "strong"
                    ? "success"
                    : "accent"
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tieColors[selectedContact.tie_type] }}
                />
                {tieLabels[selectedContact.tie_type]}
              </Badge>
            </div>

            {selectedContact.tags.length > 0 && (
              <div>
                <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selectedContact.tags.map((tag) => (
                    <Badge key={tag} variant="muted">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2">
              <Button variant="primary" size="sm" className="w-full">Add to playbook</Button>
              <Button variant="secondary" size="sm" className="w-full">Edit contact</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
