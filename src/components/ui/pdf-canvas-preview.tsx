"use client";

import { useEffect, useRef, useState } from "react";

/** Rendert ein PDF per pdf.js auf <canvas> — für Handys/Tablets, deren Browser ein PDF im <iframe>
 * gar nicht (Android Chrome) oder nur als starre erste Seite (iOS Safari) anzeigen. Die Seiten
 * werden auf die Containerbreite skaliert und bei Größenänderung neu gezeichnet. pdf.js wird erst
 * hier dynamisch geladen, damit es nicht im Bundle jeder Seite landet. */
export function PdfCanvasPreview({ blob, title, className = "" }: { blob: Blob; title: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [breite, setBreite] = useState(0);
  const [fehler, setFehler] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([eintrag]) => setBreite(Math.floor(eintrag.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || breite === 0) return;
    let abgebrochen = false;
    let ladeTask: { destroy: () => Promise<void> } | null = null;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
        ladeTask = task;
        const pdf = await task.promise;
        if (abgebrochen) return;

        const seiten: HTMLCanvasElement[] = [];
        const pixelRatio = window.devicePixelRatio || 1;
        for (let nummer = 1; nummer <= pdf.numPages; nummer++) {
          const seite = await pdf.getPage(nummer);
          const massstab = breite / seite.getViewport({ scale: 1 }).width;
          const viewport = seite.getViewport({ scale: massstab * pixelRatio });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = "100%";
          canvas.className = "block rounded-lg border border-line bg-white shadow-sm";
          await seite.render({ canvas, viewport }).promise;
          if (abgebrochen) return;
          seiten.push(canvas);
        }
        container.replaceChildren(...seiten);
        setFehler(false);
      } catch {
        if (!abgebrochen) setFehler(true);
      }
    })();

    return () => { abgebrochen = true; void ladeTask?.destroy(); };
  }, [blob, breite]);

  return (
    <div className={`w-full ${className}`}>
      <div ref={containerRef} role="img" aria-label={title} className="flex w-full flex-col gap-3" />
      {fehler ? <p className="text-center text-sm text-danger">Vorschau konnte nicht angezeigt werden — bitte „PDF herunterladen“ nutzen.</p> : null}
    </div>
  );
}
