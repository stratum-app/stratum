import { ScoreRing } from "@/components/ui/score-ring";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockScore = {
  overall: 67,
  weak_tie_ratio: 58,
  bridge_count: 4,
  cluster_count: 6,
  reach_score: 72,
  diversity_score: 43,
  dormant_count: 11,
};

const mockPlaybookItems = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    role: "Professor of CS",
    action: "Reconnect",
    rationale: "You haven't spoken in 8 months. She sits at the bridge between academia and industry.",
    priority: "high" as const,
    type: "reactivate" as const,
  },
  {
    id: "2",
    name: "Marcus Webb",
    role: "Product @ Figma",
    action: "Warm intro available",
    rationale: "You and Aisha both know Marcus. An intro could open a direct line to Figma recruiting.",
    priority: "high" as const,
    type: "introduce" as const,
  },
  {
    id: "3",
    name: "Lena Torres",
    role: "Founder, YC W24",
    action: "Deepen",
    rationale: "A weak tie in your startup cluster — one substantive conversation could shift this to a strong tie.",
    priority: "medium" as const,
    type: "deepen" as const,
  },
];

const mockRecentContacts = [
  { id: "1", name: "James Okafor", role: "SWE Intern @ Stripe", last: "3d ago", strength: "strong" },
  { id: "2", name: "Aisha Patel", role: "Stanford MBA", last: "1w ago", strength: "moderate" },
  { id: "3", name: "Chris Lim", role: "VC Analyst", last: "2w ago", strength: "weak" },
];

const strengthColor: Record<string, string> = {
  strong: "#4A8C5C",
  moderate: "#B8860B",
  weak: "#C44820",
  dormant: "#2A2A2A",
};

const actionTypeLabel: Record<string, string> = {
  reactivate: "Reactivate",
  introduce: "Introduce",
  deepen: "Deepen",
  leverage: "Leverage",
};

export default function DashboardPage() {
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
          Last analyzed 2 hours ago &middot; 34 contacts
        </p>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-4 gap-px bg-[#1F1F1F] rounded-[6px] overflow-hidden mb-6">
        <div className="bg-[#161616] p-6 flex flex-col items-center gap-4">
          <ScoreRing score={mockScore.overall} size="lg" label="Capital Score" sublabel="Overall" />
        </div>
        <div className="bg-[#161616] p-6 flex flex-col gap-4 justify-center">
          <div>
            <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body mb-1">Weak tie ratio</p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {mockScore.weak_tie_ratio}%
              </span>
              <Badge variant="success">Good</Badge>
            </div>
            <p className="text-[11px] text-[#2A2A2A] font-body mt-1">Target: &gt;50%</p>
          </div>
          <div>
            <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body mb-1">Bridge contacts</p>
            <span
              className="text-2xl font-light text-[#F5F0E8]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {mockScore.bridge_count}
            </span>
          </div>
        </div>
        <div className="bg-[#161616] p-6 flex flex-col gap-4 justify-center">
          <div>
            <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body mb-1">Reach score</p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {mockScore.reach_score}
              </span>
              <span className="text-xs text-[#4A4640] font-body">/100</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body mb-1">Diversity</p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {mockScore.diversity_score}
              </span>
              <span className="text-xs text-[#4A4640] font-body">/100</span>
              <Badge variant="warning">Low</Badge>
            </div>
          </div>
        </div>
        <div className="bg-[#161616] p-6 flex flex-col justify-center">
          <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body mb-3">Dormant ties</p>
          <span
            className="text-4xl font-light text-[#C44820] mb-1"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {mockScore.dormant_count}
          </span>
          <p className="text-[11px] text-[#4A4640] font-body mb-4">
            relationships you haven&apos;t activated
          </p>
          <Link href="/playbook">
            <Button variant="primary" size="sm">Activate now</Button>
          </Link>
        </div>
      </div>

      {/* Two-column: playbook + recent */}
      <div className="grid grid-cols-5 gap-5">
        {/* Playbook preview */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-light text-[#F5F0E8]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Playbook
            </h2>
            <Link href="/playbook" className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {mockPlaybookItems.map((item) => (
              <Card key={item.id} hover className="group">
                <CardContent className="py-4 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#F5F0E8] font-body">{item.name}</span>
                        <Badge variant={item.priority === "high" ? "accent" : "muted"}>
                          {actionTypeLabel[item.type]}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#4A4640] font-body mb-1.5">{item.role}</p>
                      <p className="text-xs text-[#8A8578] font-body leading-relaxed">{item.rationale}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 opacity-0 group-hover:opacity-100">
                      Act
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-light text-[#F5F0E8]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Recent
            </h2>
            <Link href="/contacts" className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors">
              View all →
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-[#1F1F1F]">
              {mockRecentContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-medium text-[#8A8578] font-body">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F5F0E8] font-body truncate">{c.name}</p>
                    <p className="text-[11px] text-[#4A4640] font-body truncate">{c.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: strengthColor[c.strength] }}
                    />
                    <span className="text-[11px] text-[#4A4640] font-body">{c.last}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Network preview link */}
          <Link href="/network">
            <Card hover className="mt-3">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8A8578] font-body">View network graph</p>
                  <p className="text-[11px] text-[#4A4640] font-body mt-0.5">
                    {mockScore.cluster_count} clusters detected
                  </p>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="text-[#2A2A2A]">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
