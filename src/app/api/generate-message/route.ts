import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { daysSince } from "@/lib/scoring";
import type { Contact } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  let body: { contact: Contact; userGoal?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { contact, userGoal } = body;
  const days = daysSince(contact.last_contact);
  const lastContactStr =
    days === Infinity
      ? "never"
      : days > 365
      ? `over a year ago`
      : days > 30
      ? `${Math.floor(days / 30)} months ago`
      : `${days} days ago`;

  const prompt = `You are helping a student write a genuine, human-sounding outreach message to a professional contact.

Contact:
- Name: ${contact.name}
- Role: ${contact.role ?? "unknown"}
- Organization: ${contact.organization ?? "unknown"}
- Sector: ${contact.industry ?? "unknown"}
- Relationship: ${contact.relationship_type ?? "professional contact"}
- Tie strength: ${contact.tie_strength}/5
- Last contact: ${lastContactStr}

Student's goal: ${userGoal ?? "general networking and career development"}

Write a short, genuine outreach message (2–4 sentences). Rules:
- Sound like a real person wrote it — not a template or AI
- Reference their specific role or sector naturally
- One clear, low-pressure ask at the end
- Warm but not sycophantic
- Do NOT start with "Hi [Name]," — start mid-thought
- No placeholder text like [University] or [Your Name]

Return only the message, nothing else.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }],
    });

    const message =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    return NextResponse.json({ message });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
