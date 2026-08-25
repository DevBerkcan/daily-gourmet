"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui";
import { apiFetchBlob } from "@/lib/api/client";

type Inhalt = "Vollstaendig" | "NurNaehrwerte" | "OhneNaehrwerte";
type Orientierung = "Quer" | "Hoch";

const radioClass = "flex cursor-pointer items-center gap-2 text-sm text-ink";

/** dd.MM.yyyy, wie auf dem Etikett und im Referenz-PDF — <input type="date"> liefert yyyy-MM-dd. */
function toGermanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

/** Live-Vorschau + Export für das Rezept-Etikett (GET /recipes/{id}/label) — die Vorschau ist das
 * echte, serverseitig mit QuestPDF gerenderte PDF (siehe RecipeLabelDocument), kein Nachbau in CSS,
 * damit Vorschau und Export nie auseinanderlaufen können. */
export function EtikettenGeneratorModal({
  rezeptId,
  rezeptName,
  portionsgewichtG,
  onClose,
}: {
  rezeptId: string;
  rezeptName: string;
  portionsgewichtG: number | undefined;
  onClose: () => void;
}) {
  const [inhalt, setInhalt] = useState<Inhalt>("Vollstaendig");
  const [orientierung, setOrientierung] = useState<Orientierung>("Quer");
  const [proPortion, setProPortion] = useState(false);
  const [portionsgroesse, setPortionsgroesse] = useState(portionsgewichtG ?? 0);
  const [mhd, setMhd] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const zeigtNaehrwerte = inhalt !== "OhneNaehrwerte";

  useEffect(() => {
    let verworfen = false;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ orientierung, inhalt, proPortion: String(proPortion) });
      if (proPortion && portionsgroesse > 0) params.set("portionsgroesseG", String(portionsgroesse));
      if (mhd) params.set("mindestensHaltbarBis", toGermanDate(mhd));

      setLaedt(true);
      setFehler(null);
      apiFetchBlob(`/recipes/${rezeptId}/label?${params.toString()}`)
        .then((blob) => {
          if (verworfen) return;
          const url = URL.createObjectURL(blob);
          setPreviewUrl((vorherige) => {
            if (vorherige) URL.revokeObjectURL(vorherige);
            return url;
          });
        })
        .catch(() => { if (!verworfen) setFehler("Etikett konnte nicht erzeugt werden."); })
        .finally(() => { if (!verworfen) setLaedt(false); });
    }, 350);

    return () => { verworfen = true; window.clearTimeout(timer); };
  }, [rezeptId, orientierung, inhalt, proPortion, portionsgroesse, mhd]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function herunterladen() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `etikett-${rezeptName}.pdf`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="etiketten-generator-title"
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-card border border-line bg-surface shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 id="etiketten-generator-title" className="font-display text-lg font-semibold text-ink">Etiketten-Generator</h2>
            <p className="mt-0.5 text-sm text-muted">{rezeptName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Schließen" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink">
            <X size={19} aria-hidden />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[1fr_18rem]">
          <div className="flex items-center justify-center overflow-auto bg-paper p-6">
            {fehler ? (
              <p className="text-sm text-danger">{fehler}</p>
            ) : previewUrl ? (
              <object data={previewUrl} type="application/pdf" className={`rounded-lg border border-line bg-white shadow-sm ${laedt ? "opacity-50" : ""}`} style={{ width: orientierung === "Quer" ? "100%" : "50%", minHeight: "70vh" }}>
                <p className="text-sm text-muted">PDF-Vorschau wird von diesem Browser nicht unterstützt.</p>
              </object>
            ) : (
              <Loader2 className="animate-spin text-muted" size={28} aria-hidden />
            )}
          </div>

          <div className="flex flex-col gap-6 overflow-y-auto border-t border-line px-5 py-5 md:border-l md:border-t-0">
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Was möchtest du drucken?</legend>
              <div className="flex flex-col gap-2">
                <label className={radioClass}><input type="radio" checked={inhalt === "Vollstaendig"} onChange={() => setInhalt("Vollstaendig")} /> Vollständiges Lebensmitteletikett</label>
                <label className={radioClass}><input type="radio" checked={inhalt === "NurNaehrwerte"} onChange={() => setInhalt("NurNaehrwerte")} /> nur Nährwerttabelle</label>
                <label className={radioClass}><input type="radio" checked={inhalt === "OhneNaehrwerte"} onChange={() => setInhalt("OhneNaehrwerte")} /> ohne Nährwerttabelle</label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Layout</legend>
              <div className="flex flex-col gap-2">
                <label className={radioClass}><input type="radio" checked={orientierung === "Quer"} onChange={() => setOrientierung("Quer")} /> Querformat</label>
                <label className={radioClass}><input type="radio" checked={orientierung === "Hoch"} onChange={() => setOrientierung("Hoch")} /> Hochformat</label>
              </div>
            </fieldset>

            {zeigtNaehrwerte && (
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted">Nährwertangabe</legend>
                <label className={radioClass}><input type="radio" checked={!proPortion} onChange={() => setProPortion(false)} /> pro 100 g</label>
                <label className={radioClass}><input type="radio" checked={proPortion} onChange={() => setProPortion(true)} /> pro Portion</label>
                {proPortion && (
                  <label className="ml-6 flex items-center gap-2 text-xs text-muted">
                    Portionsgröße
                    <input
                      type="number" min={0} step={0.1} value={portionsgroesse || ""}
                      onChange={(e) => setPortionsgroesse(Number(e.target.value) || 0)}
                      className="min-h-8 w-20 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
                    /> g
                  </label>
                )}
              </fieldset>
            )}

            <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Mindestens haltbar bis
              <input
                type="date" value={mhd} onChange={(e) => setMhd(e.target.value)}
                className="min-h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm font-normal normal-case text-ink"
              />
            </label>

            <Button onClick={herunterladen} disabled={!previewUrl || laedt}>
              <Download size={15} aria-hidden /> PDF herunterladen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
