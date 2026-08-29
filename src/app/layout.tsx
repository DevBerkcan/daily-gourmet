import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Daily Gourmet", template: "%s · Daily Gourmet" },
  description: "Catering-Management-Plattform der Gentle Group",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the nonce here (SEC-07, see middleware.ts) is what makes Next.js thread it onto its
  // own framework-managed <script> tags and inline hydration data for this request — without this
  // read, the CSP nonce in the response header has no effect on Next's own scripts and the app's
  // entire JS bundle gets silently blocked by the browser. Confirmed via headless Chrome: without
  // this line every chunk (webpack/main-app/page) and every inline RSC payload script was refused.
  await headers();
  return (
    <html lang="de" suppressHydrationWarning>
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
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
