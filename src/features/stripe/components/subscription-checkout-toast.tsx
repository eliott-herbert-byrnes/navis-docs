"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function SubscriptionCheckoutToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const status = searchParams.get("status");
    if (!status) return;

    if (status === "success") {
      toast.success(
        "Subscription updated successfully. It may take a moment to reflect.",
      );
    } else if (status === "canceled") {
      toast.info("Checkout canceled. No changes were made.");
    }

    router.replace(pathname);
  }, [searchParams, router, pathname]);

  return null;
}
