export type ConnectionStrength = "strong" | "moderate" | "weak" | "dormant";
export type TieType = "strong" | "weak" | "bridge";
export type CapitalType = "economic" | "cultural" | "social" | "institutional";

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
  last_contact?: string;
  connection_strength: ConnectionStrength;
  tie_type: TieType;
  social_capital_score: number;
  bridging_score: number;
  bonding_score: number;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  user_id: string;
  contact_a_id: string;
  contact_b_id: string;
  relationship_type: string;
  strength: ConnectionStrength;
  created_at: string;
}

export interface NetworkScore {
  overall: number;
  weak_tie_ratio: number;
  bridge_count: number;
  cluster_count: number;
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
  onboarding_complete: boolean;
  subscription_tier: "free" | "pro";
  created_at: string;
}
