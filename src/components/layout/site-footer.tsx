import Link from "next/link";
import { StratumMark } from "@/components/ui/stratum-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1F1F1F] py-10 px-8 bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <StratumMark size={24} />
              <span
                className="text-sm font-light tracking-[0.2em] text-[#4A4640] uppercase"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Stratum
              </span>
            </div>
            <p className="text-xs text-[#2A2A2A] font-body italic">
              Go deeper than the surface.
            </p>
            <a
              href="mailto:teamatstratum@gmail.com"
              className="text-[11px] text-[#2A2A2A] hover:text-[#4A4640] font-body transition-colors"
            >
              teamatstratum@gmail.com
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/pricing"
              className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors"
            >
              Sign in
            </Link>
            <a
              href="mailto:teamatstratum@gmail.com"
              className="text-xs text-[#4A4640] hover:text-[#8A8578] font-body transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="border-t border-[#1F1F1F] mt-8 pt-6">
          <p className="text-[11px] text-[#2A2A2A] font-body">
            © 2026 Stratum. Built by students, for students.
          </p>
        </div>
      </div>
    </footer>
  );
}
