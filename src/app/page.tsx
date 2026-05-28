import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StratumMark } from "@/components/ui/stratum-mark";
import { SiteFooter } from "@/components/layout/site-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Nav */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-[#1F1F1F]">
        <Link href="/" className="hover:opacity-75 transition-opacity">
          <StratumMark size={28} />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-[#8A8578] hover:text-[#F5F0E8] transition-colors font-body"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-[#8A8578] hover:text-[#F5F0E8] transition-colors font-body"
          >
            Sign in
          </Link>
          <Link href="/auth/signup">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl animate-fade-up">
          <p
            className="text-2xl font-light tracking-[0.35em] text-[#F5F0E8] uppercase mb-5"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            STRATUM
          </p>
          <p className="text-xs tracking-[0.3em] text-[#4A4640] uppercase font-body mb-5">
            Personal Network Intelligence
          </p>
          <h1
            className="text-5xl md:text-7xl font-light text-[#F5F0E8] leading-[1.05] mb-6"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Go deeper than
            <br />
            <em className="text-[#C44820] not-italic">the surface.</em>
          </h1>
          <p className="text-base text-[#8A8578] font-body leading-relaxed mb-10 max-w-lg mx-auto">
            Your network is richer than you think. Stratum maps your existing
            connections, scores them using social capital theory, and gives you
            an AI-powered playbook to activate relationships that actually move
            the needle.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg">Map your network</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign in</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Social proof strip */}
      <section className="border-t border-[#1F1F1F] py-6 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { stat: "85%", label: "of jobs are filled through networking, not job boards", source: "LinkedIn / BLS" },
            { stat: "70%", label: "of job openings are never publicly advertised", source: "CNBC" },
            { stat: "83%", label: "of people who found jobs through a contact knew them only casually", source: "Granovetter, 1973" },
          ].map(({ stat, label, source }) => (
            <div key={stat}>
              <p
                className="text-2xl font-light text-[#C44820] mb-1"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {stat}
              </p>
              <p className="text-xs text-[#4A4640] font-body leading-snug mb-1">{label}</p>
              <p className="text-[10px] text-[#2A2A2A] font-body">{source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#1F1F1F] py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-[#4A4640] uppercase font-body mb-12 text-center">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1F1F1F]">
            {[
              {
                step: "01",
                title: "Map",
                body: "Import your contacts or add them manually. Stratum builds a visual graph of your existing network — professors, peers, alumni, mentors.",
              },
              {
                step: "02",
                title: "Score",
                body: "Every connection is scored using Granovetter's weak tie theory, Bourdieu's capital framework, and Putnam's bridging vs. bonding model.",
              },
              {
                step: "03",
                title: "Activate",
                body: "Your AI playbook surfaces dormant relationships, missing bridges, and high-leverage introductions — with ready-to-send messages.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="bg-[#0A0A0A] p-8">
                <p className="text-xs text-[#2A2A2A] font-body font-medium tracking-widest mb-4">
                  {step}
                </p>
                <h3
                  className="text-2xl font-light text-[#F5F0E8] mb-3"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-[#4A4640] font-body leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
