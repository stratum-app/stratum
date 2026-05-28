export type TieClass = "strong" | "medium" | "weak";
export type ConnectionStrength = "strong" | "moderate" | "weak" | "dormant";
export type TieType = TieClass; // legacy alias — use TieClass going forward
export type CapitalType = "economic" | "cultural" | "social" | "institutional";
export type RelationshipType =
  | "professional"
  | "mentor"
  | "friend"
  | "acquaintance"
  | "family"
  | "teacher"
  | "classmate"
  | "colleague";

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  role?: string;
  organization?: string;
  industry?: string;
  location?: string;
  notes?: string;
  tags: string[];
  last_contact?: string;        // ISO date string (YYYY-MM-DD)
  tie_strength: number;         // 1–5 numeric, authoritative
  relationship_type?: RelationshipType;
  // Derived/legacy — populated from scoring functions
  connection_strength: ConnectionStrength;
  social_capital_score: number;
  bridging_score: number;
  bonding_score: number;
  created_at: string;
  updated_at: string;
}

export interface NetworkScore {
  overall: number;
  weak_tie_ratio: number;
  bridge_count: number;
  reach_score: number;
  diversity_score: number;
  dormant_count: number;
}

export interface PlaybookItem {
  id: string;
  user_id: string;
  contact_id: string;
  contact?: Contact;
  action_type: "reactivate" | "introduce" | "leverage" | "deepen";
  title: string;
  rationale: string;
  suggested_message?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "done" | "dismissed";
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  university?: string;
  major?: string;
  graduation_year?: number;
  bio?: string;
  avatar_url?: string;
  goal?: string;
  onboarding_complete: boolean;
  subscription_tier: "free" | "pro";
  created_at: string;
}
