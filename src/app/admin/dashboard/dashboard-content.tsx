"use client";

import Link from "next/link";
import { PageHeader, StatCard, Card, CardHeader, Table, Td, StatusBadge, Button } from "@/components/ui";
import { CalendarPlus, ShoppingBasket, Factory } from "lucide-react";
import { useAdminDashboardSummary, useBenachrichtigungen } from "@/lib/services/dashboard";
import { useSpeiseplaene } from "@/lib/services/meal-plans";
import { useBestellungen } from "@/lib/services/orders";
import { useEinrichtungen } from "@/lib/services/facilities";
import { isoWeekInfo } from "@/lib/isoWeek";
import { HEUTE } from "@/lib/heute";
import { useTranslation } from "@/lib/i18n/I18nContext";

export function DashboardContent() {
  const { t } = useTranslation();
  const summary = useAdminDashboardSummary();
  const speiseplaene = useSpeiseplaene();
  const benachrichtigungen = useBenachrichtigungen();
  const einrichtungen = useEinrichtungen();
  const { week, year } = isoWeekInfo(new Date(HEUTE));
  const aktuellerPlan = speiseplaene.find((p) => p.kalenderwoche === week && p.jahr === year);
  const bestellungen = useBestellungen(aktuellerPlan ? { speiseplanId: aktuellerPlan.id } : undefined);
  const entwuerfe = summary ? summary.bestellungenDieseWoche - summary.verbindlicheBestellungen : 0;

  return (
    <>
      <PageHeader
        title={t("adminDashboard.title")}
        subtitle={t("adminDashboard.subtitle", { week })}
        actions={
          <>
            <Button variant="secondary" href="/admin/production"><Factory size={15} aria-hidden /> {t("adminDashboard.productionToday")}</Button>
            <Button href="/admin/meal-plans/new"><CalendarPlus size={15} aria-hidden /> {t("adminDashboard.newMealPlan")}</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("adminDashboard.ordersThisWeek", { week })}
          value={String(summary?.bestellungenDieseWoche ?? "—")}
          hint={summary ? t("adminDashboard.bindingHint", { binding: summary.verbindlicheBestellungen, draft: entwuerfe }) : undefined}
        />
        <StatCard label={t("adminDashboard.portionsToday")} value={String(summary?.portionenHeute ?? "—")} />
        <StatCard label={t("adminDashboard.facilitiesWithoutOrder")} value={String(summary?.einrichtungenOhneBestellung ?? "—")} tone={summary?.einrichtungenOhneBestellung ? "warn" : "ok"} />
        <StatCard label={t("adminDashboard.mealPlanNextWeek")} value={summary?.naechsteWocheSpeiseplanStatus ?? t("adminDashboard.notPlanned")} tone={summary?.naechsteWocheSpeiseplanStatus === "REVIEW" ? "warn" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title={t("adminDashboard.ordersOfWeek")}
            actions={<Link href="/admin/orders" className="text-xs font-medium text-basil hover:underline">{t("adminDashboard.allOrders")}</Link>}
          />
          {bestellungen.length ? (
            <Table head={[t("common.facility"), t("common.status"), t("common.sentAt"), t("common.deadline")]}>
              {bestellungen.map((b) => (
                <tr key={b.id} className="hover:bg-paper">
                  <Td className="font-medium text-ink">{einrichtungen.find((e) => e.id === b.einrichtungId)?.name ?? b.einrichtungId}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td className="text-muted">{b.abgesendetAm ?? "—"}</Td>
                  <Td className="text-muted">{b.frist}</Td>
                </tr>
              ))}
            </Table>
          ) : (
            <p className="px-5 py-6 text-sm text-muted">{aktuellerPlan ? t("adminDashboard.noOrdersForPlan") : t("adminDashboard.noPlanThisWeek")}</p>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title={t("adminDashboard.mealPlans")} />
            <ul className="divide-y divide-line text-sm">
              {speiseplaene.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/meal-plans/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                    <span className="font-medium text-ink">KW {p.kalenderwoche} / {p.jahr}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title={t("adminDashboard.recentChanges")} />
            <ul className="divide-y divide-line">
              {benachrichtigungen.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-ink">{n.titel}</p>
                  <p className="text-xs text-muted">{n.text}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{n.zeitpunkt}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 no-print">
        <Link href="/admin/procurement" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <ShoppingBasket size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">{t("adminDashboard.checkProcurement")}</span>
        </Link>
        <Link href="/admin/production" className="flex items-center gap-3 rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-basil hover:bg-basil-soft">
          <Factory size={18} className="text-basil" aria-hidden />
          <span className="text-sm font-medium text-ink">{t("adminDashboard.prepareProduction")}</span>
        </Link>
      </div>
    </>
  );
}
