import type { StorageAdapter } from "./adapter";

const MSG =
  "Storage is not configured. Set STORAGE_PROVIDER and the required credentials (Supabase URL + service role key, or S3 settings).";

function noop(operation: string): never {
  console.warn(`[storage] ${operation} called but storage is not configured`);
  throw new Error(MSG);
}

export function createNoopStorageAdapter(): StorageAdapter {
  return {
    async upload(
      _bucket: string,
      _path: string,
      _body: Buffer,
      _options: { contentType: string; upsert?: boolean },
    ) {
      noop("upload");
    },
    async download(_bucket: string, _path: string) {
      noop("download");
    },
    async createSignedUrl(_bucket: string, _path: string, _ttlSeconds: number) {
      noop("createSignedUrl");
    },
    async remove(_bucket: string, paths: string[]) {
      if (paths.length === 0) return;
      noop("remove");
    },
    async list(
      _bucket: string,
      _prefix: string,
      _options?: { limit?: number; offset?: number },
    ) {
      noop("list");
    },
  };
}
