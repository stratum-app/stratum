"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "confirmation_failed"
      ? "Email confirmation failed. Please try signing up again."
      : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-7">
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="rounded-[4px] bg-red-950/30 border border-red-900/40 px-3 py-2.5">
            <p className="text-xs text-red-400 font-body">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          variant="primary"
          size="md"
          className="w-full"
          type="submit"
          loading={loading}
        >
          Sign in
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
    </div>
  );
}

export default function LoginPage() {
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
            Sign in to continue
          </p>
        </div>

        <Suspense fallback={<div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-7 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-[#4A4640] font-body mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-[#8A8578] hover:text-[#F5F0E8] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
