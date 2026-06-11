import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoredToken } from "@/lib/gmail";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ connected: false, email: null });
  }

  try {
    const token = await getStoredToken(supabase, user.id);
    return NextResponse.json({
      connected: !!token,
      email: token?.gmail_email ?? null,
    });
  } catch {
    return NextResponse.json({ connected: false, email: null });
  }
}
