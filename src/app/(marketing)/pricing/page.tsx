import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StratumMark } from "@/components/ui/stratum-mark";
import { SiteFooter } from "@/components/layout/site-footer";

const INSTITUTIONAL_MAILTO =
  "mailto:teamatstratum@gmail.com?subject=Stratum%20Institutional%20Inquiry";

const tiers = [
  {
    name: "Free",
    priceLabel: "$0",
    period: "forever",
    description: "For students just starting to map their network.",
    cta: "Start Free Trial",
    ctaHref: "/auth/signup",
    ctaVariant: "outline" as const,
    ctaExternal: false,
    note: null,
    features: [
      "Up to 15 connections",
      "Basic network graph view",
      "One gap report per month",
      "Connection strength scoring",
      "Manual contact entry",
    ],
    limitations: [
      "No AI outreach generator",
      "No capital audit",
      "No historical snapshots",
    ],
    highlight: false,
  },
  {
    name: "Student Pro",
    priceLabel: "$8",
    period: "/ month",
    description: "For students serious about activating their network.",
    cta: "Get Student Pro",
    ctaHref: "/auth/signup?plan=pro",
    ctaVariant: "primary" as const,
    ctaExternal: false,
    note: "Billing begins after your 7-day free trial. Cancel anytime.",
    features: [
      "Unlimited connections",
      "Full social capital audit",
      "AI outreach message generator",
      "Monthly network snapshots",
      "Weak tie & bridge detection",
      "Playbook with ranked actions",
      "CSV / LinkedIn import",
      "Email support",
    ],
    limitations: [],
    highlight: true,
  },
  {
    name: "Institutional",
    priceLabel: "Contact us",
    period: "",
    description: "For career centers and university programs.",
    cta: "Contact Us",
    ctaHref: INSTITUTIONAL_MAILTO,
    ctaVariant: "outline" as const,
    ctaExternal: true,
    note: null,
    features: [
      "Everything in Student Pro",
      "School-wide licensing",
      "Admin dashboard",
      "Cohort analytics",
      "Anonymized aggregate data",
      "SSO / LMS integration",
      "Dedicated onboarding",
      "SLA + priority support",
    ],
    limitations: [],
    highlight: false,
  },
];

const checkIcon = (
  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="shrink-0 mt-0.5">
    <path d="M2.5 7l3 3 6-6" stroke="#4A8C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const xIcon = (
  <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="shrink-0 mt-0.5">
    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#4A4640" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Nav */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-[#1F1F1F]">
        <Link href="/" className="hover:opacity-75 transition-opacity">
          <StratumMark size={28} />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#F5F0E8] font-body">Pricing</span>
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

      <main className="flex-1 px-6 py-20">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs tracking-[0.3em] text-[#4A4640] uppercase font-body mb-4">
            Pricing
          </p>
          <h1
            className="text-5xl font-light text-[#F5F0E8] leading-[1.05] mb-4"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Invest in your network.
            <br />
            <em className="text-[#C44820] not-italic">Not your job board.</em>
          </h1>
          <p className="text-sm text-[#8A8578] font-body leading-relaxed">
            Stratum is priced for students. Start free. Upgrade when you&apos;re serious.
          </p>
        </div>

        {/* Tiers */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1F1F1F] rounded-[6px] overflow-hidden">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col p-8 ${
                tier.highlight ? "bg-[#161616]" : "bg-[#0A0A0A]"
              }`}
            >
              {/* Tier header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs text-[#4A4640] uppercase tracking-widest font-body">
                    {tier.name}
                  </p>
                  {tier.highlight && (
                    <span className="text-[10px] bg-[#7A2C14]/20 text-[#C44820] border border-[#7A2C14]/40 px-1.5 py-0.5 rounded-[3px] font-body uppercase tracking-wider">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="font-light text-[#F5F0E8]"
                    style={{
                      fontFamily: "Cormorant Garamond, Georgia, serif",
                      fontSize: tier.period ? "3rem" : "1.75rem",
                      lineHeight: 1,
                    }}
                  >
                    {tier.priceLabel}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-[#4A4640] font-body">{tier.period}</span>
                  )}
                </div>
                <p className="text-xs text-[#4A4640] font-body leading-relaxed">{tier.description}</p>
              </div>

              {/* CTA */}
              <div className="mb-2">
                {tier.ctaExternal ? (
                  <a href={tier.ctaHref}>
                    <Button variant={tier.ctaVariant} size="md" className="w-full">
                      {tier.cta}
                    </Button>
                  </a>
                ) : (
                  <Link href={tier.ctaHref}>
                    <Button variant={tier.ctaVariant} size="md" className="w-full">
                      {tier.cta}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Billing note */}
              {tier.note && (
                <p className="text-[11px] text-[#4A4640] font-body mb-6 leading-relaxed">
                  {tier.note}
                </p>
              )}
              {!tier.note && <div className="mb-6" />}

              {/* Separator */}
              <div className="border-t border-[#1F1F1F] mb-6" />

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    {checkIcon}
                    <span className="text-xs text-[#8A8578] font-body leading-snug">{f}</span>
                  </li>
                ))}
                {tier.limitations.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    {xIcon}
                    <span className="text-xs text-[#4A4640] font-body leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* .edu note */}
        <p className="text-center text-xs text-[#2A2A2A] font-body mt-6">
          Student pricing requires a .edu email at checkout.
        </p>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20">
          <p className="text-xs tracking-[0.3em] text-[#4A4640] uppercase font-body mb-8 text-center">
            Common questions
          </p>
          <div className="space-y-px">
            {[
              {
                q: "Do I need a .edu email to sign up?",
                a: "You can sign up with any email. A .edu email is required to access student pricing at checkout.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Pro is month-to-month. Cancel any time and your data stays accessible on the Free plan.",
              },
              {
                q: "What does the AI playbook actually do?",
                a: "It analyzes your network graph using social capital theory, then generates ranked, prioritized actions — who to reconnect with, which bridges to activate, and what to say. Messages are generated by Claude (Anthropic).",
              },
              {
                q: "Is my network data private?",
                a: "Your contact data is stored encrypted and never sold or used to train AI models. Institutional plans get additional data isolation guarantees.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-[#161616] border border-[#1F1F1F] p-5 first:rounded-t-[6px] last:rounded-b-[6px]">
                <p className="text-sm font-medium text-[#F5F0E8] font-body mb-1.5">{q}</p>
                <p className="text-xs text-[#4A4640] font-body leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
