import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

export function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

const ENC_PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const ALGO = "aes-256-gcm";

function getAiEncryptionKey(): Buffer {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("AI_KEY_ENCRYPTION_SECRET is not set");
  }
  return createHash("sha256").update(secret).digest();
}

/**
 * AES-256-GCM encrypt. Output is safe to store in the database (prefixed).
 */
export function encrypt(text: string): string {
  const key = getAiEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, tag, enc]);
  return `${ENC_PREFIX}${combined.toString("base64")}`;
}

/**
 * Decrypts values produced by `encrypt`. Plaintext legacy values (no prefix) are returned as-is.
 */
export function decrypt(text: string): string {
  if (!text.startsWith(ENC_PREFIX)) {
    return text;
  }
  const key = getAiEncryptionKey();
  const raw = Buffer.from(text.slice(ENC_PREFIX.length), "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const enc = raw.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
    "utf8",
  );
}
