import type { Contact, TieClass, NetworkScore } from "@/types";

export function daysSince(dateStr: string | undefined): number {
  if (!dateStr) return Infinity;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function isDormant(c: Contact): boolean {
  return daysSince(c.last_contact) > 90;
}

export function classifyTie(c: Contact): TieClass {
  const days = daysSince(c.last_contact);
  if (c.tie_strength <= 2 || days > 90) return "weak";
  if (c.tie_strength >= 4 && days <= 60) return "strong";
  return "medium";
}

export function bridgingRatio(contacts: Contact[]): number {
  if (!contacts.length) return 0;
  const counts = new Map<string, number>();
  contacts.forEach((c) => {
    if (c.industry) counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1);
  });
  const bridges = contacts.filter(
    (c) => c.industry && (counts.get(c.industry) ?? 0) < 3
  ).length;
  return Math.round((bridges / contacts.length) * 100);
}

export function reachScore(contacts: Contact[]): number {
  if (!contacts.length) return 0;
  const avg =
    contacts.reduce((s, c) => s + (c.tie_strength ?? 3), 0) / contacts.length;
  return Math.min(100, Math.round(avg * 20));
}

export function diversityScore(contacts: Contact[]): number {
  if (!contacts.length) return 0;
  const unique = new Set(contacts.map((c) => c.industry).filter(Boolean)).size;
  return Math.min(100, Math.round((unique / 15) * 100));
}

export function dormantCount(contacts: Contact[]): number {
  return contacts.filter(isDormant).length;
}

export function overallScore(contacts: Contact[]): number {
  if (!contacts.length) return 0;
  const r = reachScore(contacts);
  const d = diversityScore(contacts);
  const b = bridgingRatio(contacts);
  const dormPenalty = Math.min(
    30,
    (dormantCount(contacts) / contacts.length) * 30
  );
  return Math.max(0, Math.round(r * 0.4 + d * 0.3 + b * 0.3 - dormPenalty));
}

export function opportunityScore(c: Contact, all: Contact[]): number {
  const dormant = isDormant(c) ? 2 : 1;
  const sectorCount = all.filter((x) => x.industry === c.industry).length;
  const sectorGap = sectorCount < 3 ? 2 : 1;
  const strengthInverse = 6 - (c.tie_strength ?? 3);
  return dormant * sectorGap * strengthInverse;
}

export function networkScore(contacts: Contact[]): NetworkScore {
  return {
    overall: overallScore(contacts),
    weak_tie_ratio: contacts.length
      ? Math.round(
          (contacts.filter((c) => classifyTie(c) === "weak").length /
            contacts.length) *
            100
        )
      : 0,
    bridge_count: contacts.length
      ? (() => {
          const counts = new Map<string, number>();
          contacts.forEach((c) => {
            if (c.industry)
              counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1);
          });
          return contacts.filter(
            (c) => c.industry && (counts.get(c.industry) ?? 0) < 3
          ).length;
        })()
      : 0,
    reach_score: reachScore(contacts),
    diversity_score: diversityScore(contacts),
    dormant_count: dormantCount(contacts),
  };
}

export type OutreachChannel = {
  primary: string;
  primaryHref?: (contact: Contact) => string;
  secondary?: string;
};

export function outreachChannel(c: Contact): OutreachChannel {
  switch (c.relationship_type) {
    case "professional":
    case "mentor":
    case "colleague":
      return {
        primary: "LinkedIn",
        primaryHref: (c) =>
          `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(c.name)}`,
        secondary: c.email ? "Email" : undefined,
      };
    case "teacher":
      return {
        primary: "Email",
        primaryHref: c.email ? () => `mailto:${c.email}` : undefined,
        secondary: "LinkedIn",
      };
    case "friend":
    case "acquaintance":
    case "classmate":
      return { primary: "iMessage / Text", secondary: "Instagram" };
    case "family":
      return { primary: "Text" };
    default:
      return {
        primary: "LinkedIn",
        primaryHref: (c) =>
          `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(c.name)}`,
        secondary: c.email ? "Email" : undefined,
      };
  }
}

export function whyThisContact(c: Contact, allContacts: Contact[]): string {
  const days = daysSince(c.last_contact);
  const tie = classifyTie(c);
  const sectorCount = allContacts.filter((x) => x.industry === c.industry).length;
  const isRareSector = sectorCount < 3;

  if (days === Infinity) {
    return `You've never reached out to ${c.name.split(" ")[0]}. ${isRareSector ? `They work in ${c.industry}, a sector with few contacts in your network.` : "Getting in touch would open a new connection."}`;
  }
  if (days > 180) {
    return `You haven't spoken to ${c.name.split(" ")[0]} in over ${Math.floor(days / 30)} months${isRareSector ? ` — and they're one of your only contacts in ${c.industry}` : ""}.`;
  }
  if (days > 90) {
    return `This connection has gone dormant (${days} days). ${isRareSector ? `${c.industry} is underrepresented in your network.` : "Reactivating it now costs far less than rebuilding it later."}`;
  }
  if (tie === "weak" && isRareSector) {
    return `${c.name.split(" ")[0]} is a weak tie in ${c.industry}, a sector gap in your network — exactly where Granovetter says opportunities hide.`;
  }
  if (tie === "weak") {
    return `A weak tie with ${c.name.split(" ")[0]} — strengthening it could open clusters of your network you can't currently access.`;
  }
  return `${c.name.split(" ")[0]} has a high opportunity score based on recency, sector, and tie strength.`;
}
