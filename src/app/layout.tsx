import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stratum — Go deeper than the surface.",
  description:
    "Map your network. Score your social capital. Activate relationships that matter.",
  openGraph: {
    title: "Stratum",
    description: "Go deeper than the surface.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0F0F0F] text-[#F5F0E8] antialiased">
        {children}
      </body>
    </html>
  );
}
