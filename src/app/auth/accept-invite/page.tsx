import { Suspense } from "react";
import { AcceptInviteClient } from "./accept-invite-client";

function AcceptInviteFallback() {
  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <AcceptInviteClient />
    </Suspense>
  );
}
