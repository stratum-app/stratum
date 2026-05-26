"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type ActionType = "reactivate" | "introduce" | "leverage" | "deepen";
type Priority = "high" | "medium" | "low";
type Status = "pending" | "done" | "dismissed";

interface PlaybookEntry {
  id: string;
  contact_name: string;
  contact_role: string;
  action_type: ActionType;
  title: string;
  rationale: string;
  suggested_message: string;
  priority: Priority;
  status: Status;
}

const mockItems: PlaybookEntry[] = [
  {
    id: "1",
    contact_name: "Dr. Priya Sharma",
    contact_role: "Professor, MIT CS",
    action_type: "reactivate",
    title: "Reconnect with your strongest academic bridge",
    rationale: "You haven't spoken in 8 months. Dr. Sharma sits at the intersection of academia and industry — she has direct pipelines to research labs and is known to make introductions for students she believes in. Your last conversation ended positively.",
    suggested_message: "Hi Dr. Sharma — I've been thinking about our conversation on ML interpretability. I've been exploring the intersection of fairness constraints and LLM fine-tuning and would love to share what I've found. Would you have 20 minutes sometime this month?",
    priority: "high",
    status: "pending",
  },
  {
    id: "2",
    contact_name: "Marcus Webb",
    contact_role: "Product Manager, Figma",
    action_type: "introduce",
    title: "Aisha can warm you into Figma's PM team",
    rationale: "Aisha Patel and Marcus Webb were both at the Stanford Design conference last spring. A mutual introduction here bypasses cold outreach — warm intros to Figma PMs are rare and high-value given their selective hiring.",
    suggested_message: "Hey Aisha — would you be comfortable introducing me to Marcus Webb? I know you two met at the Stanford Design conference. I'm exploring PM roles at design-forward companies and Figma is at the top of my list.",
    priority: "high",
    status: "pending",
  },
  {
    id: "3",
    contact_name: "Chris Lim",
    contact_role: "VC Analyst, Sequoia",
    action_type: "leverage",
    title: "Your highest-reach contact — schedule a coffee chat",
    rationale: "Chris has the highest bridging score in your network (95). VC analysts are professional connectors — one conversation can open 3-5 new nodes. He's a weak tie now, but a single substantive touchpoint can unlock that entire cluster.",
    suggested_message: "Hi Chris — I'm a CS student at [University] exploring the intersection of AI and early-stage investing. I've been following Sequoia's seed thesis on infrastructure. Would you be open to a 20-minute chat? I have a few questions I think would be worth your time.",
    priority: "high",
    status: "pending",
  },
  {
    id: "4",
    contact_name: "Lena Torres",
    contact_role: "Founder, Stealth YC W24",
    action_type: "deepen",
    title: "Convert a weak tie into a peer relationship",
    rationale: "Lena is building in a space adjacent to your interests. Weak ties in startup clusters are high-optionality — being early in someone's orbit as a founder is disproportionately valuable.",
    suggested_message: "Hey Lena — really impressed by what you shared at the YC demo day recap. I've been thinking about the distribution problem you mentioned. Want to grab coffee and compare notes?",
    priority: "medium",
    status: "pending",
  },
  {
    id: "5",
    contact_name: "Nate Kim",
    contact_role: "Quant Researcher, Two Sigma",
    action_type: "reactivate",
    title: "A dormant tie with high financial capital",
    rationale: "You connected at a hackathon 14 months ago. Nate works in a sector with a talent shortage — and he's 2 degrees from three other Two Sigma researchers in your extended network.",
    suggested_message: "Hey Nate — it's been a while since the HackMIT days. I've been doing a lot of work on stochastic optimization and thought of you. How's life at Two Sigma?",
    priority: "medium",
    status: "pending",
  },
];

const actionTypeConfig: Record<ActionType, { label: string; variant: "accent" | "success" | "default" | "warning" }> = {
  reactivate: { label: "Reactivate", variant: "accent" },
  introduce: { label: "Introduce", variant: "default" },
  leverage: { label: "Leverage", variant: "warning" },
  deepen: { label: "Deepen", variant: "success" },
};

const priorityDot: Record<Priority, string> = {
  high: "#C44820",
  medium: "#B8860B",
  low: "#4A4640",
};

export default function PlaybookPage() {
  const [items, setItems] = useState(mockItems);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const pending = items.filter((i) => i.status === "pending").length;

  function markDone(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "done" } : i)));
  }

  function dismiss(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "dismissed" } : i)));
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
            {pending} action{pending !== 1 ? "s" : ""} recommended &middot; AI-generated from your network
          </p>
        </div>
        <Button variant="primary" size="sm">Regenerate</Button>
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
              : "Add more contacts to generate new recommendations."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const cfg = actionTypeConfig[item.action_type];
            const isExpanded = expanded === item.id;
            const isDone = item.status === "done";

            return (
              <Card
                key={item.id}
                className={`transition-all duration-200 ${isDone ? "opacity-40" : ""}`}
              >
                <CardContent className="py-4 px-5">
                  {/* Header row */}
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                  >
                    {/* Priority + index */}
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ backgroundColor: priorityDot[item.priority] }}
                      />
                      <span className="text-xs text-[#2A2A2A] font-body w-4">{String(idx + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-[#F5F0E8] font-body">{item.contact_name}</span>
                        <span className="text-xs text-[#4A4640] font-body">{item.contact_role}</span>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-[#8A8578] font-body">{item.title}</p>
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
                        <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1.5">Rationale</p>
                        <p className="text-sm text-[#8A8578] font-body leading-relaxed">{item.rationale}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#4A4640] uppercase tracking-widest font-body mb-1.5">Suggested message</p>
                        <div className="bg-[#1E1E1E] rounded-[4px] p-3.5 border border-[#2A2A2A]">
                          <p className="text-xs text-[#F5F0E8] font-body leading-relaxed italic">
                            &ldquo;{item.suggested_message}&rdquo;
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => markDone(item.id)}
                          disabled={isDone}
                        >
                          {isDone ? "Done" : "Mark done"}
                        </Button>
                        <Button variant="secondary" size="sm">Copy message</Button>
                        <Button variant="ghost" size="sm" onClick={() => dismiss(item.id)}>
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
    </div>
  );
}
