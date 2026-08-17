"use client";

import { Button, Card, CardHeader, StatusBadge, Table, Td } from "@/components/ui";
import { usePortalSpeiseplaene } from "@/lib/services/meal-plans";
import { useRezepte } from "@/lib/services/recipes";
import { useBestellungen } from "@/lib/services/orders";

export function OrdersHistory() {
  const eigene = useBestellungen();
  const speiseplaene = usePortalSpeiseplaene();
  const rezepte = useRezepte();
  return <div className="flex flex-col gap-6">{eigene.map((bestellung) => {
    const plan = speiseplaene.find((eintrag) => eintrag.id === bestellung.speiseplanId);
    const gesamt = bestellung.positionen.reduce((summe, position) => summe + position.portionen, 0);
    return <Card key={bestellung.id}><CardHeader title={`Bestellung KW ${plan?.kalenderwoche ?? "—"}`} hint={`Frist: ${bestellung.frist}${bestellung.abgesendetAm ? ` · Abgesendet: ${bestellung.abgesendetAm}` : ""}`} actions={<div className="flex items-center gap-2"><StatusBadge status={bestellung.status} />{bestellung.status !== "LOCKED" ? <Button href="/portal/meal-plans" variant="secondary">Bearbeiten</Button> : null}</div>} /><div className="flex items-center justify-between gap-3 border-b border-line bg-paper/50 px-5 py-3 text-sm"><span className="text-muted">Bestellte Portionen gesamt</span><strong className="font-display text-xl text-basil">{gesamt}</strong></div><Table head={["Tag", "Gericht", "Portionen", "Hinweis"]}>{bestellung.positionen.map((position, index) => <tr key={`${position.datum}-${position.rezeptId}-${index}`}><Td className="whitespace-nowrap text-muted">{new Date(`${position.datum}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })}</Td><Td className="font-medium text-ink">{rezepte.find((r) => r.id === position.rezeptId)?.name}</Td><Td className="font-semibold">{position.portionen}</Td><Td className="text-muted">{position.hinweis ?? "—"}</Td></tr>)}</Table>{bestellung.status === "LOCKED" ? <p className="border-t border-line px-5 py-3 text-xs text-muted">Die Frist ist abgelaufen. Korrekturen sind nur noch durch Daily Gourmet möglich und werden protokolliert.</p> : null}</Card>;
  })}</div>;
}
