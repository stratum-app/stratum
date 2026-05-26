"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    href: "/network",
    label: "Network",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="2.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="13.5" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="2.5" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="13.5" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.25" />
        <line x1="4" y1="3.5" x2="6" y2="7" stroke="currentColor" strokeWidth="1.25" />
        <line x1="12" y1="3.5" x2="10" y2="7" stroke="currentColor" strokeWidth="1.25" />
        <line x1="4" y1="12.5" x2="6" y2="9" stroke="currentColor" strokeWidth="1.25" />
        <line x1="12" y1="12.5" x2="10" y2="9" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    href: "/playbook",
    label: "Playbook",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.25" />
        <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="5" y1="8.5" x2="9" y2="8.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="5" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[200px] min-h-screen bg-[#0F0F0F] border-r border-[#1F1F1F]">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#1F1F1F]">
        <span
          className="text-xl font-light tracking-[0.15em] text-[#F5F0E8] uppercase"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Stratum
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 h-8 px-2.5 rounded-[4px]",
                  "text-sm font-body font-medium transition-all duration-100",
                  active
                    ? "bg-[#1E1E1E] text-[#F5F0E8]"
                    : "text-[#4A4640] hover:text-[#8A8578] hover:bg-[#161616]"
                )}
              >
                <span className={cn(active ? "text-[#C44820]" : "text-current")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom: settings + score teaser */}
      <div className="py-4 px-3 border-t border-[#1F1F1F] space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 h-8 px-2.5 rounded-[4px]",
            "text-sm font-body font-medium transition-all duration-100",
            pathname.startsWith("/settings")
              ? "bg-[#1E1E1E] text-[#F5F0E8]"
              : "text-[#4A4640] hover:text-[#8A8578] hover:bg-[#161616]"
          )}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
            <path
              d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.929 2.929l1.06 1.06M12.01 12.01l1.06 1.06M2.929 13.07l1.06-1.06M12.01 3.99l1.06-1.06"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  );
}
