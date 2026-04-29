import { resetDemoData } from "@/lib/demo-reset";
import { DEMO_ORG_CACHE_TAG } from "@/lib/org-dashboard-cache";
import { revalidatePath, revalidateTag } from "next/cache";

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

async function runCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret?.length) {
    return new Response("Cron not configured", { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return unauthorized();
  }

  await resetDemoData();
  revalidateTag(DEMO_ORG_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}

/** Vercel Cron invokes scheduled jobs with GET. */
export async function GET(req: Request) {
  return runCron(req);
}

/** POST allows manual triggers with the same Bearer token. */
export async function POST(req: Request) {
  return runCron(req);
}
