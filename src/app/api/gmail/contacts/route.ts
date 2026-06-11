import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getValidAccessToken,
  fetchAllGoogleContacts,
  mapGooglePersonToContact,
} from "@/lib/gmail";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(supabase, user.id);
    if (!accessToken) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 403 });
    }

    const people = await fetchAllGoogleContacts(accessToken);

    const contacts = people
      .map((p) => mapGooglePersonToContact(p, user.id))
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return NextResponse.json({ contacts, total: contacts.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
