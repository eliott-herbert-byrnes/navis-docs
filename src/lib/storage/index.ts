import { supabaseAdmin } from "@/lib/supabase/admin";
import type { StorageAdapter } from "./adapter";
import { createNoopStorageAdapter } from "./noop-adapter";
import { createS3ClientFromEnv, createS3StorageAdapter } from "./s3-adapter";
import { createSupabaseStorageAdapter } from "./supabase-adapter";

let supabaseAdapter: StorageAdapter | null = null;
let s3Adapter: StorageAdapter | null = null;
let noopAdapter: StorageAdapter | null = null;

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function hasS3Env(): boolean {
  return Boolean(
    process.env.S3_REGION?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim(),
  );
}

function getSupabaseAdapter(): StorageAdapter {
  if (!supabaseAdapter) {
    supabaseAdapter = createSupabaseStorageAdapter(supabaseAdmin);
  }
  return supabaseAdapter;
}

function getS3Adapter(): StorageAdapter {
  if (!s3Adapter) {
    s3Adapter = createS3StorageAdapter(createS3ClientFromEnv());
  }
  return s3Adapter;
}

function getNoopAdapter(): StorageAdapter {
  if (!noopAdapter) {
    noopAdapter = createNoopStorageAdapter();
  }
  return noopAdapter;
}

export function getStorageAdapter(): StorageAdapter {
  const raw = process.env.STORAGE_PROVIDER?.trim().toLowerCase();

  if (raw === "s3") {
    return getS3Adapter();
  }
  if (raw === "supabase") {
    return getSupabaseAdapter();
  }
  if (raw) {
    throw new Error(`Unknown STORAGE_PROVIDER: ${raw}`);
  }

  // Unset: infer from env, or degraded mode when nothing is configured.
  if (!hasSupabaseEnv() && !hasS3Env()) {
    return getNoopAdapter();
  }
  if (hasSupabaseEnv() && hasS3Env()) {
    return getSupabaseAdapter();
  }
  if (hasSupabaseEnv()) {
    return getSupabaseAdapter();
  }
  return getS3Adapter();
}

export const storage = new Proxy({} as StorageAdapter, {
  get(_, prop) {
    const adapter = getStorageAdapter();
    const value = adapter[prop as keyof StorageAdapter];
    if (typeof value === "function") {
      return (
        value as (this: StorageAdapter, ...args: unknown[]) => unknown
      ).bind(adapter);
    }
    return value;
  },
});

export type { StorageAdapter } from "./adapter";
