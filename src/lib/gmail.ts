import type { SupabaseClient } from "@supabase/supabase-js";
import type { Contact } from "@/types";

// ── Token storage ─────────────────────────────────────────────────────────────

export interface GmailTokenRecord {
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  token_expiry: string | null;
  gmail_email: string | null;
}

export async function getStoredToken(
  supabase: SupabaseClient,
  userId: string
): Promise<GmailTokenRecord | null> {
  const { data } = await supabase
    .from("gmail_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data ?? null;
}

export async function storeToken(
  supabase: SupabaseClient,
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string | null;
    expires_in?: number;
    gmail_email?: string | null;
  }
): Promise<void> {
  const expiry = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  await supabase.from("gmail_tokens").upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    token_expiry: expiry,
    gmail_email: tokens.gmail_email ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteToken(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase.from("gmail_tokens").delete().eq("user_id", userId);
}

// ── Token lifecycle ───────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed: ${body}`);
  }
  return res.json();
}

export async function revokeToken(accessToken: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

// Returns a valid access token, refreshing if needed. Returns null if not connected.
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const record = await getStoredToken(supabase, userId);
  if (!record) return null;

  const willExpireSoon = record.token_expiry
    ? new Date(record.token_expiry).getTime() - Date.now() < 60_000
    : false;

  if (willExpireSoon && record.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(record.refresh_token);
      await storeToken(supabase, userId, {
        access_token: refreshed.access_token,
        refresh_token: record.refresh_token,
        expires_in: refreshed.expires_in,
        gmail_email: record.gmail_email,
      });
      return refreshed.access_token;
    } catch {
      // Refresh token revoked or expired — clear the record
      await deleteToken(supabase, userId);
      return null;
    }
  }

  return record.access_token;
}

// ── Google People API ─────────────────────────────────────────────────────────

export interface GooglePerson {
  resourceName: string;
  names?: { displayName: string; givenName?: string; familyName?: string }[];
  emailAddresses?: { value: string; metadata?: { primary?: boolean } }[];
  organizations?: { name?: string; title?: string }[];
}

export async function fetchAllGoogleContacts(
  accessToken: string
): Promise<GooglePerson[]> {
  const all: GooglePerson[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      personFields: "names,emailAddresses,organizations",
      pageSize: "100",
      sortOrder: "LAST_MODIFIED_DESCENDING",
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(
      `https://people.googleapis.com/v1/people/me/connections?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`People API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    if (data.connections) all.push(...data.connections);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

// ── Contact mapping ───────────────────────────────────────────────────────────

function industryFromText(org: string, role: string): string {
  const t = `${role} ${org}`.toLowerCase();
  if (/software|engineer|developer|tech|data|ml|ai|product/.test(t)) return "Tech";
  if (/finance|bank|invest|capital|fund|trading/.test(t)) return "Finance";
  if (/professor|research|university|phd|postdoc|faculty|academic/.test(t)) return "Academia";
  if (/doctor|medical|hospital|health|pharma|clinic/.test(t)) return "Healthcare";
  if (/founder|startup|ceo|co-founder|entrepreneur/.test(t)) return "Startup";
  if (/lawyer|legal|attorney|law/.test(t)) return "Legal";
  if (/design|ux|creative|art|media/.test(t)) return "Design";
  if (/government|policy|public|federal|state/.test(t)) return "Government";
  return "Other";
}

export function mapGooglePersonToContact(
  person: GooglePerson,
  userId: string
): Contact | null {
  const name = person.names?.[0]?.displayName?.trim();
  if (!name) return null;

  const primaryEmail = person.emailAddresses?.find(
    (e) => e.metadata?.primary
  )?.value ?? person.emailAddresses?.[0]?.value;

  const org = person.organizations?.[0];
  const role = org?.title?.trim() || undefined;
  const organization = org?.name?.trim() || undefined;
  const industry = role || organization
    ? industryFromText(organization ?? "", role ?? "")
    : "Other";

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    email: primaryEmail,
    role,
    organization,
    industry,
    tags: [],
    tie_strength: 2,
    relationship_type: "professional",
    last_contact: undefined,
    connection_strength: "weak",
    social_capital_score: 0,
    relationship_score: 0,
    bridging_score: 0,
    bonding_score: 0,
    created_at: now,
    updated_at: now,
  };
}
