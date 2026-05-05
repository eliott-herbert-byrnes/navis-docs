import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { StorageAdapter } from "./adapter";

export function createSupabaseStorageAdapter(
  client: SupabaseClient<Database>,
): StorageAdapter {
  return {
    async upload(bucket, path, body, options) {
      const { error } = await client.storage.from(bucket).upload(path, body, {
        contentType: options.contentType,
        upsert: options.upsert ?? false,
      });
      if (error) throw new Error(error.message);
    },

    async download(bucket, path) {
      const { data, error } = await client.storage.from(bucket).download(path);
      if (error || !data) {
        throw new Error(error?.message ?? "Download failed");
      }
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    },

    async createSignedUrl(bucket, path, ttlSeconds) {
      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(path, ttlSeconds);
      if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? "Could not create signed URL");
      }
      return data.signedUrl;
    },

    async remove(bucket, paths) {
      if (paths.length === 0) return;
      const { error } = await client.storage.from(bucket).remove(paths);
      if (error) throw new Error(error.message);
    },

    async list(bucket, prefix, options) {
      const { data, error } = await client.storage.from(bucket).list(prefix, {
        limit: options?.limit,
        offset: options?.offset,
      });
      if (error) throw new Error(error.message);
      return (data ?? [])
        .filter((obj) => typeof obj.name === "string")
        .map((obj) => ({ name: obj.name }));
    },
  };
}
