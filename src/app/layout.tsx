import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stratum — Personal Network Intelligence",
  description:
    "Map your existing connections, score your social capital, and get an AI-powered playbook to activate relationships that actually move the needle.",
  openGraph: {
    title: "Stratum — Personal Network Intelligence",
    description:
      "Map your existing connections, score your social capital, and get an AI-powered playbook to activate relationships that actually move the needle.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0A0A0A] text-[#F5F0E8] antialiased">
        {children}
      </body>
    </html>
  );
}
