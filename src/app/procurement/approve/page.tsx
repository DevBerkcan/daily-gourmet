"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useApproveEinkaufsliste } from "@/lib/services/procurement";
import { ApiError } from "@/lib/api/client";

/** Öffentliche Seite ohne Login — erreichbar über den in der Freigabe-E-Mail verlinkten Token.
 * Siehe ProcurementListHandler.ApproveAsync auf dem Backend für die Token-Prüfung. */
function ApproveContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const token = params.get("token");
  const approve = useApproveEinkaufsliste();
  const [ausgeloest, setAusgeloest] = useState(false);

  useEffect(() => {
    if (id && token && !ausgeloest) {
      setAusgeloest(true);
      approve.mutate({ id, token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, ausgeloest]);

  if (!id || !token) {
    return (
      <div className="text-center">
        <XCircle size={40} className="mx-auto text-danger" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-ink">Ungültiger Link</h1>
        <p className="mt-2 text-sm text-muted">Diesem Freigabe-Link fehlen erforderliche Angaben.</p>
      </div>
    );
  }

  if (approve.isPending || !ausgeloest) {
    return <p className="text-center text-sm text-muted">Freigabe wird geprüft …</p>;
  }

  if (approve.isError) {
    const message = approve.error instanceof ApiError ? approve.error.message : "Die Freigabe konnte nicht verarbeitet werden.";
    return (
      <div className="text-center">
        <XCircle size={40} className="mx-auto text-danger" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-ink">Freigabe fehlgeschlagen</h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <CheckCircle2 size={40} className="mx-auto text-ok" aria-hidden />
      <h1 className="mt-4 text-lg font-semibold text-ink">Bestellung freigegeben</h1>
      <p className="mt-2 text-sm text-muted">
        {approve.data?.label} für Kalenderwoche {approve.data?.calendarWeek} wurde freigegeben und kann jetzt bestellt werden.
      </p>
    </div>
  );
}

export default function ProcurementApprovePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8">
        <Suspense fallback={<p className="text-center text-sm text-muted">Lädt …</p>}>
          <ApproveContent />
        </Suspense>
      </div>
    </div>
  );
}
