import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoredToken, revokeToken, deleteToken } from "@/lib/gmail";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getStoredToken(supabase, user.id);
    if (token) {
      // Best-effort revocation — don't fail if Google is unreachable
      await revokeToken(token.access_token).catch(() => {});
      await deleteToken(supabase, user.id);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
