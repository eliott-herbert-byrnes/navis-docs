export function canonicalEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const atIdx = trimmed.lastIndexOf("@");
  if (atIdx === -1) return trimmed;
  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);
  const normalizedDomain = domain === "googlemail.com" ? "gmail.com" : domain;
  return `${local}@${normalizedDomain}`;
}
