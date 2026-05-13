"use client";
import { CardCompact } from "@/components/ui/auth-card";
import { Button } from "@/components/ui/button";
import { useAcceptInvitation } from "@/features/invite/hooks/use-invite-mutations";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export function AcceptInviteClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { acceptInvitation, isPending } = useAcceptInvitation();
  const [error, setError] = useState<string>("");
  const { status } = useSession();
  const router = useRouter();

  const handleAccept = () => {
    if (!token) {
      setError("Invalid invitation token");
      return;
    }

    if (status === "unauthenticated") {
      const callbackUrl = `/auth/accept-invite?token=${token}`;
      router.push(
        `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
      return;
    }

    setError("");
    acceptInvitation(token);
  };

  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px] pt-50">
      <div className="flex flex-row gap-2 items-center">
        <Image
          src="/navis-docs-logo-svg.svg"
          width={45}
          height={45}
          alt="Navis Docs logo"
        />
        <h2 className="text-4xl font-serif">Navis Docs</h2>
      </div>
      <CardCompact
        title="Join Organization"
        description="Accept your invitation to join"
        className="flex flex-col gap-3 mt-3 w-full"
        content={
          <div className="flex flex-col gap-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleAccept}
              disabled={!token}
              isLoading={isPending || status === "loading"}
              className="w-full"
            >
              Accept Invitation
            </Button>
          </div>
        }
      />
    </div>
  );
}
