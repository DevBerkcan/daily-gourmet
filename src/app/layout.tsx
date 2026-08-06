import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Daily Gourmet", template: "%s · Daily Gourmet" },
  description: "Catering-Management-Plattform der Gentle Group",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Outfit (Display) + Work Sans (UI) — laut Branding. Per <link> statt next/font,
            damit der Build auch ohne Internetzugang funktioniert. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@500..800&family=Work+Sans:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
