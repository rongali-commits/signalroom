import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalRoom | Customer intelligence workspace",
  description: "Turn customer evidence into clear, accountable product decisions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
