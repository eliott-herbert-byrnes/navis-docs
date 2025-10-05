import { createHash } from "crypto";

export function sha256(s: string) {
    return createHash("sha256").update(s).digest("hex");
  }