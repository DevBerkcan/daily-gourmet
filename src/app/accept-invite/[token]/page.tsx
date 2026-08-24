import { AcceptInviteForm } from "./accept-invite-form";

export const metadata = { title: "Passwort festlegen" };

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8">
        <AcceptInviteForm token={token} />
      </div>
    </div>
  );
}
