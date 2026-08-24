"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, type LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AppShellProps {
  areaLabel: string;
  areaTone: "platform" | "tenant" | "portal" | "driver";
  nav: NavItem[];
  userName: string;
  userRole: string;
  children: ReactNode;
}

const toneStyles = {
  platform: { chip: "bg-ink text-paper", ring: "border-ink" },
  tenant: { chip: "bg-basil text-white", ring: "border-basil" },
  portal: { chip: "bg-info text-white", ring: "border-info" },
  driver: { chip: "bg-ok text-white", ring: "border-ok" },
} as const;

export function AppShell({ areaLabel, areaTone, nav, userName, userRole, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const tone = toneStyles[areaTone];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    if (!profileOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const navList = (
    <nav aria-label="Hauptnavigation" className="flex flex-col gap-1 px-3">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-basil ${
              active ? "bg-basil-soft text-basil" : "text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            <item.icon size={17} strokeWidth={2} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="px-6 pb-5 pt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-daily-gourmet.png" alt="Daily Gourmet" className="h-9 w-auto" />
      <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${tone.chip}`}>
        {areaLabel}
      </span>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 hidden w-62 flex-col border-r border-line bg-surface lg:flex no-print">
        {brand}
        <div className="flex-1 overflow-y-auto pb-4">{navList}</div>
        <div className="border-t border-line px-6 py-4">
          <p className="text-sm font-medium text-ink">{userName}</p>
          <p className="text-xs text-muted">{userRole}</p>
          <button type="button" onClick={handleLogout} className="mt-3 flex items-center gap-2 text-xs font-medium text-muted hover:text-danger">
            <LogOut size={14} aria-hidden /> Abmelden
          </button>
        </div>
      </aside>
      <div className="hidden lg:block" aria-hidden />

      {/* Content-Spalte */}
      <div className="flex min-w-0 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur md:px-8 no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Menü öffnen"
              className="flex size-10 items-center justify-center rounded-lg text-ink hover:bg-paper lg:hidden"
            >
              <Menu size={20} />
            </button>
            <p className="hidden text-sm text-muted sm:block">
              KW 32 · Donnerstag, 06. August 2026
            </p>
          </div>
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Profilmenü"
              className={`flex size-9 items-center justify-center rounded-full border-2 ${tone.ring} bg-paper text-xs font-semibold text-ink transition-colors hover:bg-basil-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil`}
            >
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </button>
            {profileOpen && (
              <div role="menu" aria-label="Profil" className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-medium text-ink">{userName}</p>
                  <p className="text-xs text-muted">{userRole}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    handleLogout();
                  }}
                  className="flex min-h-10 w-full cursor-pointer items-center gap-2 px-4 text-sm font-medium text-danger hover:bg-danger-soft"
                >
                  <LogOut size={15} aria-hidden /> Abmelden
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-xl">
            <div className="flex items-start justify-between pr-3">
              {brand}
              <button type="button" onClick={() => setOpen(false)} aria-label="Menü schließen" className="mt-5 flex size-10 items-center justify-center rounded-lg hover:bg-paper">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-6">{navList}</div>
          </div>
        </div>
      )}
    </div>
  );
}
