"use client";

import { type FormEvent, useState } from "react";
import { Pencil, Plus, Truck } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui";
import { useUsers } from "@/lib/services/users";
import { useCreateFahrer, useFahrer, useUpdateFahrer } from "@/lib/services/logistics";

const fieldClass = "min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-basil";

/** Benutzer mit Rolle DRIVER haben kein automatisches Fahrerprofil (Telefon/Fahrzeug/Kennzeichen) —
 * ohne dieses Profil schlägt die Anmeldung des Fahrers mit "Kein Fahrerprofil" fehl. Diese Karte
 * schließt genau diese Lücke zwischen Benutzeranlage (Super Admin) und Routenplanung. */
export function DriverManager() {
  const nutzer = useUsers();
  const fahrer = useFahrer();
  const createFahrer = useCreateFahrer();
  const updateFahrer = useUpdateFahrer();
  const [bearbeiteUserId, setBearbeiteUserId] = useState<string | null>(null);
  const [telefon, setTelefon] = useState("");
  const [fahrzeug, setFahrzeug] = useState("");
  const [kennzeichen, setKennzeichen] = useState("");

  const fahrerNutzer = nutzer.filter((person) => person.rolle === "DRIVER");
  if (fahrerNutzer.length === 0) return null;

  const profilByUserId = new Map(fahrer.map((profil) => [profil.userId, profil]));

  function bearbeitungStarten(userId: string) {
    const bestehend = profilByUserId.get(userId);
    setBearbeiteUserId(userId);
    setTelefon(bestehend?.telefon ?? "");
    setFahrzeug(bestehend?.fahrzeug ?? "");
    setKennzeichen(bestehend?.kennzeichen ?? "");
  }

  function speichern(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    const bestehend = profilByUserId.get(userId);
    const daten = { phone: telefon.trim(), vehicleDescription: fahrzeug.trim(), licensePlate: kennzeichen.trim() };
    const onSuccess = () => setBearbeiteUserId(null);
    if (bestehend) updateFahrer.mutate({ id: bestehend.id, ...daten }, { onSuccess });
    else createFahrer.mutate({ userId, ...daten }, { onSuccess });
  }

  return (
    <Card className="mb-6">
      <CardHeader
        title="Fahrerprofile"
        hint="Telefon, Fahrzeug und Kennzeichen für Benutzer mit der Rolle Fahrer hinterlegen — ohne Profil kann sich der Fahrer nicht anmelden."
        actions={<Truck size={19} className="text-basil" aria-hidden />}
      />
      <div className="flex flex-col gap-3 p-5">
        {fahrerNutzer.map((person) => {
          const profil = profilByUserId.get(person.id);
          const bearbeitetGerade = bearbeiteUserId === person.id;
          return (
            <div key={person.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{person.name}</p>
                  <p className="text-xs text-muted">
                    {person.email}
                    {profil ? ` · ${profil.telefon} · ${profil.fahrzeug} · ${profil.kennzeichen}` : " · Kein Profil hinterlegt"}
                  </p>
                </div>
                {!bearbeitetGerade ? (
                  <Button variant="secondary" onClick={() => bearbeitungStarten(person.id)}>
                    {profil ? <><Pencil size={14} aria-hidden /> Bearbeiten</> : <><Plus size={14} aria-hidden /> Profil anlegen</>}
                  </Button>
                ) : null}
              </div>
              {bearbeitetGerade ? (
                <form onSubmit={(event) => speichern(event, person.id)} className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input value={telefon} onChange={(event) => setTelefon(event.target.value)} placeholder="Telefon" required className={fieldClass} />
                  <input value={fahrzeug} onChange={(event) => setFahrzeug(event.target.value)} placeholder="Fahrzeug, z. B. Sprinter 3.5t" required className={fieldClass} />
                  <input value={kennzeichen} onChange={(event) => setKennzeichen(event.target.value)} placeholder="Kennzeichen" required className={fieldClass} />
                  <div className="flex gap-2 sm:col-span-3">
                    <Button type="submit">Speichern</Button>
                    <Button variant="secondary" onClick={() => setBearbeiteUserId(null)}>Abbrechen</Button>
                  </div>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
