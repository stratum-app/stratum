"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { getProfile, saveProfile, useContacts, FREE_CONTACT_LIMIT, FREE_AI_MONTHLY_LIMIT, getAiUsage } from "@/lib/contacts-store";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { contacts } = useContacts();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    if (profile?.name) setName(profile.name);
    if (profile?.goal) setGoal(profile.goal);

    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  function handleSave() {
    saveProfile({ name, goal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const usage = getAiUsage();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
  const aiUsedThisMonth = usage.month === currentMonth ? usage.count : 0;

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : email
    ? email[0].toUpperCase()
    : "?";

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-light text-[#F5F0E8] mb-1"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Settings
        </h1>
        <p className="text-sm text-[#4A4640] font-body">Manage your profile and subscription</p>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Profile</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                <span className="text-sm font-medium text-[#8A8578] font-body">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#F5F0E8] font-body">{name || "—"}</p>
                <p className="text-xs text-[#4A4640] font-body">{email || "—"}</p>
              </div>
            </div>
            <Input
              label="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Networking goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Land a software engineering role at a startup"
            />
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={handleSave}>
                {saved ? "Saved!" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Usage this month</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#8A8578] font-body">Contacts</p>
                <p className="text-[11px] text-[#4A4640] font-body mt-0.5">
                  {contacts.length} of {FREE_CONTACT_LIMIT} free contacts used
                </p>
              </div>
              <span
                className="text-xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {contacts.length}/{FREE_CONTACT_LIMIT}
              </span>
            </div>
            <div className="w-full h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C44820] rounded-full transition-all"
                style={{ width: `${Math.min(100, (contacts.length / FREE_CONTACT_LIMIT) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-medium text-[#8A8578] font-body">AI messages</p>
                <p className="text-[11px] text-[#4A4640] font-body mt-0.5">
                  {aiUsedThisMonth} of {FREE_AI_MONTHLY_LIMIT} free messages used this month
                </p>
              </div>
              <span
                className="text-xl font-light text-[#F5F0E8]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {aiUsedThisMonth}/{FREE_AI_MONTHLY_LIMIT}
              </span>
            </div>
            <div className="w-full h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C44820] rounded-full transition-all"
                style={{ width: `${Math.min(100, (aiUsedThisMonth / FREE_AI_MONTHLY_LIMIT) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Subscription</h2>
              <Badge variant="muted">Free plan</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[#F5F0E8] font-body font-medium mb-0.5">Free</p>
                <p className="text-xs text-[#4A4640] font-body">
                  {FREE_CONTACT_LIMIT} contacts · {FREE_AI_MONTHLY_LIMIT} AI messages/month
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-light text-[#F5F0E8]"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  $0
                </p>
                <p className="text-xs text-[#4A4640] font-body">forever</p>
              </div>
            </div>

            <div className="bg-[#1E1E1E] rounded-[4px] p-4 border border-[#2A2A2A] mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-[#F5F0E8] font-body">Stratum Pro</p>
                  <p className="text-xs text-[#4A4640] font-body">Unlimited contacts · Full AI playbook · Advanced scoring</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-light text-[#C44820]"
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                  >
                    $8
                  </p>
                  <p className="text-xs text-[#4A4640] font-body">/month</p>
                </div>
              </div>
              <Button variant="primary" size="sm" className="w-full" onClick={() => router.push("/pricing")}>
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Integrations</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1E1E1E] border border-[#2A2A2A] rounded-[4px] flex items-center justify-center">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 13 13" className="text-[#4A4640]">
                    <path d="M1.5 4.5h2v7h-2v-7zm1-3a1 1 0 110 2 1 1 0 010-2zm3.5 3h1.9v.96h.03c.27-.5.92-1.02 1.89-1.02 2.02 0 2.39 1.33 2.39 3.06V11.5h-2v-2.6c0-.62-.01-1.42-.87-1.42-.87 0-1 .68-1 1.37v2.65h-2v-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#8A8578] font-body">LinkedIn</p>
                  <p className="text-[11px] text-[#4A4640] font-body">Import via CSV export</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/onboarding")}>
                Import
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1E1E1E] border border-[#2A2A2A] rounded-[4px] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#4A4640]">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#8A8578] font-body">Gmail</p>
                  <p className="text-[11px] text-[#4A4640] font-body">Coming soon — requires Pro</p>
                </div>
              </div>
              <Badge variant="muted">Pro</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-[#F5F0E8] font-body">Account</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#8A8578] font-body">Sign out</p>
                <p className="text-xs text-[#4A4640] font-body mt-0.5">Sign out of your account on this device.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>Sign out</Button>
            </div>
            <div className="border-t border-[#1F1F1F] pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-400 font-body">Delete account</p>
                <p className="text-xs text-[#4A4640] font-body mt-0.5">Permanently delete your account and all data.</p>
              </div>
              <Button variant="danger" size="sm">Delete account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
