"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getRawContacts,
  saveRawContacts,
  FREE_CONTACT_LIMIT,
} from "@/lib/contacts-store";
import type { Contact } from "@/types";

type ImportState =
  | { phase: "loading" }
  | { phase: "denied" }
  | { phase: "error"; message: string }
  | {
      phase: "success";
      added: number;
      skipped: number;
      capped: number;
      total: number;
    };

function GmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M22 6l-10 7L2 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PulseLoader() {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-[#C44820] rounded-full"
          style={{
            animation: "pulse-dot 1.2s ease infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function GmailImportInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ImportState>({ phase: "loading" });

  useEffect(() => {
    const gmailParam = searchParams.get("gmail");
    if (gmailParam === "denied") {
      setState({ phase: "denied" });
      return;
    }
    if (gmailParam === "error") {
      setState({
        phase: "error",
        message: "Something went wrong during authorization. Please try again.",
      });
      return;
    }
    importContacts();
  }, []);

  async function importContacts() {
    setState({ phase: "loading" });

    try {
      const res = await fetch("/api/gmail/contacts");
      const data = await res.json();

      if (!res.ok) {
        setState({
          phase: "error",
          message: data.error ?? "Failed to fetch contacts from Google.",
        });
        return;
      }

      const fetched: Contact[] = data.contacts ?? [];
      const total = data.total ?? fetched.length;

      // Deduplicate against existing contacts
      const existing = getRawContacts();
      const existingEmails = new Set(
        existing.map((c) => c.email?.toLowerCase()).filter(Boolean)
      );
      const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

      const unique = fetched.filter((c) => {
        if (c.email && existingEmails.has(c.email.toLowerCase())) return false;
        if (existingNames.has(c.name.toLowerCase())) return false;
        return true;
      });

      const skipped = fetched.length - unique.length;
      const slotsAvailable = Math.max(0, FREE_CONTACT_LIMIT - existing.length);
      const toImport = unique.slice(0, slotsAvailable);
      const capped = unique.length - toImport.length;

      if (toImport.length > 0) {
        saveRawContacts([...existing, ...toImport]);
      }

      setState({ phase: "success", added: toImport.length, skipped, capped, total });
    } catch {
      setState({
        phase: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {state.phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-6 text-[#4A4640]">
                <GmailIcon />
              </div>
              <h2
                className="text-2xl font-light text-[#F5F0E8] mb-2"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Importing contacts
              </h2>
              <p className="text-sm text-[#4A4640] font-body mb-6">
                Fetching your Google contacts and mapping them to your network...
              </p>
              <div className="flex justify-center">
                <PulseLoader />
              </div>
            </motion.div>
          )}

          {state.phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="w-14 h-14 rounded-full bg-[#0D1F14] border border-[#4A8C5C]/30 flex items-center justify-center mx-auto mb-6">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M4 10l4 4 8-8"
                    stroke="#4A8C5C"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                className="text-2xl font-light text-[#F5F0E8] mb-1 text-center"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {state.added === 0
                  ? "Already up to date"
                  : `${state.added} contact${state.added !== 1 ? "s" : ""} added`}
              </h2>
              <p className="text-sm text-[#4A4640] font-body text-center mb-6">
                {state.added > 0
                  ? "Your network graph has been updated."
                  : "All Gmail contacts are already in your network."}
              </p>

              <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-[6px] p-4 mb-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#4A4640] font-body">Found in Google</span>
                  <span className="text-sm font-medium text-[#F5F0E8] font-body">{state.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#4A4640] font-body">Added to network</span>
                  <span className="text-sm font-medium text-[#4A8C5C] font-body">+{state.added}</span>
                </div>
                {state.skipped > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#4A4640] font-body">Already existed</span>
                    <span className="text-sm text-[#4A4640] font-body">{state.skipped}</span>
                  </div>
                )}
                {state.capped > 0 && (
                  <div className="pt-2 border-t border-[#2A2A2A]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-[#8A8578] font-body">Waiting for Pro</span>
                      <span className="text-sm text-[#C44820] font-body">{state.capped} more</span>
                    </div>
                    <p className="text-[11px] text-[#4A4640] font-body leading-relaxed">
                      Free accounts are limited to {FREE_CONTACT_LIMIT} contacts. Upgrade to
                      import all {state.total}.
                    </p>
                  </div>
                )}
              </div>

              {state.capped > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mb-2"
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade to Pro — import all {state.total}
                </Button>
              )}

              <Button
                variant={state.capped > 0 ? "secondary" : "primary"}
                size="sm"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Go to dashboard →
              </Button>
            </motion.div>
          )}

          {state.phase === "denied" && (
            <motion.div
              key="denied"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-6 text-[#4A4640]">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.25" />
                  <path
                    d="M6 6l6 6M12 6l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2
                className="text-2xl font-light text-[#F5F0E8] mb-2"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Access denied
              </h2>
              <p className="text-sm text-[#4A4640] font-body mb-6 max-w-xs mx-auto">
                You declined the Google permission request. No contacts were imported.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { window.location.href = "/api/auth/google"; }}
                >
                  Try again
                </Button>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="w-full">
                    Continue without Gmail
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {state.phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#1A0D0D] border border-[#C44820]/30 flex items-center justify-center mx-auto mb-6">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path
                    d="M9 1L1 16h16L9 1z"
                    stroke="#C44820"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 7v4M9 13v.5"
                    stroke="#C44820"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2
                className="text-2xl font-light text-[#F5F0E8] mb-2"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Import failed
              </h2>
              <p className="text-sm text-[#4A4640] font-body mb-6 max-w-xs mx-auto">
                {state.message}
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="primary" size="sm" onClick={importContacts}>
                  Retry
                </Button>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="w-full">
                    Back to settings
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GmailImportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-full">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#C44820] rounded-full"
                style={{
                  animation: "pulse-dot 1.2s ease infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      }
    >
      <GmailImportInner />
    </Suspense>
  );
}
