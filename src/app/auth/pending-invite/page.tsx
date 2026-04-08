import { signInPath } from "@/app/paths";
import { PageContainer } from "@/components/ui/page-container";
import Link from "next/link";

export default function PendingInvitePage() {
  return (
    <PageContainer>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-4 text-center">
          <h1 className="text-2xl font-semibold">You have a pending invitation</h1>
          <p className="text-muted-foreground text-sm">
            Check your email for an invitation link. Click the link in the email
            to join your organization.
          </p>
          <p className="text-muted-foreground text-sm">
            If you have not recieved the link, please request another from your organization administrator.
          </p>
          <p className="text-muted-foreground text-sm">
            Want to use a different account?{" "}
            <Link href={signInPath()} className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
