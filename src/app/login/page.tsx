import { LoginForm } from "./login-form";

export const metadata = { title: "Anmelden" };

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

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
