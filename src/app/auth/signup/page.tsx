"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "success";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setState("idle");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "An account with this email already exists."
          : error.message
      );
      setState("idle");
      return;
    }

    setState("success");
  }

  if (state === "success") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Link href="/">
            <span
              className="text-2xl font-light tracking-[0.15em] text-[#F5F0E8] uppercase"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Stratum
            </span>
          </Link>
          <div className="mt-10 bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-8">
            <div className="w-10 h-10 rounded-full bg-[#4A8C5C]/15 border border-[#4A8C5C]/30 flex items-center justify-center mx-auto mb-5">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path d="M3 9l4 4 8-8" stroke="#4A8C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2
              className="text-xl font-light text-[#F5F0E8] mb-2"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Check your email
            </h2>
            <p className="text-sm text-[#8A8578] font-body leading-relaxed mb-1">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-medium text-[#F5F0E8] font-body mb-4">{email}</p>
            <p className="text-xs text-[#4A4640] font-body leading-relaxed">
              Click the link in the email to confirm your account and start mapping your network.
            </p>
          </div>
          <p className="text-xs text-[#4A4640] font-body mt-5">
            Wrong email?{" "}
            <button
              onClick={() => setState("idle")}
              className="text-[#8A8578] hover:text-[#F5F0E8] transition-colors"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="text-2xl font-light tracking-[0.15em] text-[#F5F0E8] uppercase"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Stratum
            </span>
          </Link>
          <p className="text-xs text-[#4A4640] font-body mt-2 tracking-wider uppercase">
            Map your network
          </p>
        </div>

        <div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-7">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-[4px] bg-red-950/30 border border-red-900/40 px-3 py-2.5">
                <p className="text-xs text-red-400 font-body">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="w-full mt-2"
              type="submit"
              loading={state === "loading"}
            >
              Create account
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1F1F1F]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#161616] px-3 text-xs text-[#2A2A2A] font-body">or</span>
            </div>
          </div>

          <Button variant="outline" size="md" className="w-full gap-3" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.6 2.41v2h2.6c1.52-1.4 2.38-3.46 2.38-5.87z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.6-2c-.71.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H.86v2.06A8 8 0 008 16z" fill="#34A853"/>
              <path d="M3.53 9.53A4.82 4.82 0 013.28 8c0-.53.09-1.04.25-1.53V4.41H.86A8 8 0 000 8c0 1.29.31 2.51.86 3.59l2.67-2.06z" fill="#FBBC05"/>
              <path d="M8 3.18c1.17 0 2.22.4 3.05 1.2l2.28-2.28A8 8 0 00.86 4.41L3.53 6.47C4.16 4.58 5.92 3.18 8 3.18z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-[11px] text-[#2A2A2A] font-body text-center mt-4 leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="text-center text-xs text-[#4A4640] font-body mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#8A8578] hover:text-[#F5F0E8] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
