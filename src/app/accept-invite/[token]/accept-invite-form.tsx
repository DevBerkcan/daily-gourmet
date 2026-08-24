"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useInvitation, useAcceptInvitation } from "@/lib/services/invitations";
import { ApiError } from "@/lib/api/client";

const fieldClass = "min-h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-basil";

/** Public page reached from the invitation e-mail (see SuperAdminHandler/UserManagementHandler
 * SendInvitationEmailAsync) — no login required, the token in the URL is the credential. */
export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const invitation = useInvitation(token);
  const acceptInvitation = useAcceptInvitation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (password.length < 8) {
      setFormError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Die Passwörter stimmen nicht überein.");
      return;
    }
    acceptInvitation.mutate(
      { token, password },
      { onSuccess: () => router.push("/login") }
    );
  }

  if (invitation.isLoading) {
    return <p className="text-center text-sm text-muted">Einladung wird geprüft …</p>;
  }

  if (invitation.isError) {
    const message = invitation.error instanceof ApiError ? invitation.error.message : "Dieser Einladungslink ist ungültig.";
    return (
      <div className="text-center">
        <XCircle size={40} className="mx-auto text-danger" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-ink">Einladung nicht gültig</h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
      </div>
    );
  }

  if (acceptInvitation.isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle2 size={40} className="mx-auto text-ok" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-ink">Konto aktiviert</h1>
        <p className="mt-2 text-sm text-muted">Ihr Passwort wurde gespeichert. Sie werden zur Anmeldung weitergeleitet …</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold text-ink">Passwort festlegen</h1>
      <p className="mt-1 text-sm text-muted">
        Willkommen bei Daily Gourmet, {invitation.data?.name}. Legen Sie ein Passwort für <strong>{invitation.data?.email}</strong> fest.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">Neues Passwort</label>
          <input
            id="password" type="password" autoComplete="new-password" placeholder="••••••••" minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)} required className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">Passwort bestätigen</label>
          <input
            id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" minLength={8}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={fieldClass}
          />
        </div>
        {(formError || acceptInvitation.isError) && (
          <p className="text-sm text-danger">
            {formError ?? (acceptInvitation.error instanceof ApiError ? acceptInvitation.error.message : "Das Passwort konnte nicht gespeichert werden.")}
          </p>
        )}
        <button
          type="submit" disabled={acceptInvitation.isPending}
          className="min-h-11 cursor-pointer rounded-lg bg-basil text-sm font-semibold text-white transition-colors hover:bg-basil-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil disabled:opacity-60"
        >
          {acceptInvitation.isPending ? "Wird gespeichert …" : "Konto aktivieren"}
        </button>
      </form>
    </>
  );
}
