import Link from "next/link";
import { ChefHat, Soup, School, Truck } from "lucide-react";

export const metadata = { title: "Anmelden" };

const rollen = [
  { href: "/admin/dashboard", icon: ChefHat, label: "Tenant Owner", hint: "Daily Gourmet · Verwaltung" },
  { href: "/kitchen", icon: Soup, label: "Küche", hint: "Daily Gourmet · Produktion" },
  { href: "/driver", icon: Truck, label: "Fahrer", hint: "Daily Gourmet · Auslieferung" },
  { href: "/portal/dashboard", icon: School, label: "Einrichtung", hint: "Musterschule Nord · Kundenportal" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Markenseite */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-basil-deep p-12 text-white lg:flex">
        <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full border-[28px] border-basil opacity-40" />
        <div aria-hidden className="absolute -bottom-32 -left-16 size-105 rounded-full border-[36px] border-basil opacity-30" />
        <p className="relative text-sm font-medium uppercase tracking-[0.2em] text-white/60">Gentle Group</p>
        <div className="relative">
          <h1 className="font-display text-5xl font-semibold leading-[1.05]">
            Daily<br />Gourmet<span className="text-saffron">.</span>
          </h1>
          <p className="mt-5 max-w-md text-white/75">
            Speiseplanung, Bestellungen, Produktion und Einkauf — eine Plattform für Ihr Catering-Unternehmen und Ihre Einrichtungen.
          </p>
        </div>
        <p className="relative text-xs text-white/50">© 2026 Gentle Group · Alle Rechte vorbehalten</p>
      </div>

      {/* Formular */}
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-daily-gourmet.png" alt="Daily Gourmet" className="mb-6 h-10 w-auto" />
          <h2 className="font-display text-2xl font-semibold text-ink">Anmelden</h2>
          <p className="mt-1 text-sm text-muted">Melden Sie sich mit Ihrer geschäftlichen E-Mail-Adresse an.</p>

          <form className="mt-7 flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">E-Mail-Adresse</label>
              <input id="email" type="email" autoComplete="email" placeholder="name@unternehmen.de"
                className="min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink">Passwort</label>
                <span className="cursor-pointer text-xs font-medium text-basil hover:underline">Passwort vergessen?</span>
              </div>
              <input id="password" type="password" autoComplete="current-password" placeholder="••••••••"
                className="min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil" />
            </div>
            <button type="button" className="min-h-11 cursor-pointer rounded-lg bg-basil text-sm font-semibold text-white transition-colors hover:bg-basil-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil">
              Anmelden
            </button>
          </form>

          <div className="mt-9">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Demo-Ansichten (Phase 1)</p>
            <div className="mt-3 grid gap-2">
              {rollen.map((r) => (
                <Link key={r.href} href={r.href}
                  className="group flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-basil hover:bg-basil-soft">
                  <r.icon size={18} className="text-basil" aria-hidden />
                  <span>
                    <span className="block text-sm font-medium text-ink">{r.label}</span>
                    <span className="block text-xs text-muted">{r.hint}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
