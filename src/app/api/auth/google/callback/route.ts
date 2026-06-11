import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { storeToken } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied — redirect with signal
  if (error === "access_denied") {
    const response = NextResponse.redirect(new URL("/settings?gmail=denied", appUrl));
    response.cookies.delete("google_oauth_state");
    return response;
  }

  if (!code || !state) {
    const response = NextResponse.redirect(new URL("/settings?gmail=error", appUrl));
    response.cookies.delete("google_oauth_state");
    return response;
  }

  // Validate CSRF state
  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!storedState || state !== storedState) {
    const response = NextResponse.redirect(new URL("/settings?gmail=error", appUrl));
    response.cookies.delete("google_oauth_state");
    return response;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const response = NextResponse.redirect(new URL("/auth/login", appUrl));
    response.cookies.delete("google_oauth_state");
    return response;
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const response = NextResponse.redirect(new URL("/settings?gmail=error", appUrl));
    response.cookies.delete("google_oauth_state");
    return response;
  }

  const tokens = await tokenRes.json();

  // Fetch the Google account email to display in settings
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = userInfoRes.ok ? await userInfoRes.json() : null;

  await storeToken(supabase, user.id, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_in: tokens.expires_in,
    gmail_email: userInfo?.email ?? null,
  });

  const response = NextResponse.redirect(new URL("/gmail-import", appUrl));
  response.cookies.delete("google_oauth_state");
  return response;
}
