"use client";
import { CardCompact } from "@/components/ui/auth-card";
import { Button } from "@/components/ui/button";
import { useAcceptInvitation } from "@/features/invite/hooks/use-invite-mutations";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const AcceptInvitePage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { acceptInvitation, isPending } = useAcceptInvitation();
  const [error, setError] = useState<string>("");

  const handleAccept = () => {
    if (!token) {
      setError("Invalid invitation token");
      return;
    }
    setError("");
    acceptInvitation(token);
  };

  return (
    <div className="flex flex-col gap-3 items-center my-auto mx-auto w-full max-w-[350px]">
      <h2 className="text-xl font-bold">Navis Docs</h2>
      <h1 className="text-3xl font-semibold">Organization Invitation</h1>
      <CardCompact
        title="Join Organization"
        description="Accept your invitation to join"
        className="flex flex-col gap-3 mt-3 w-full"
        content={
          <div className="flex flex-col gap-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-sm text-muted-foreground">
              You have been invited to join an organization
            </p>
            <Button
              onClick={handleAccept}
              disabled={isPending || !token}
              className="w-full"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept Invitation
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default AcceptInvitePage;
