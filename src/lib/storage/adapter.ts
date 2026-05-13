export interface StorageAdapter {
  upload(
    bucket: string,
    path: string,
    body: Buffer,
    options: { contentType: string; upsert?: boolean },
  ): Promise<void>;
  download(bucket: string, path: string): Promise<Buffer>;
  createSignedUrl(
    bucket: string,
    path: string,
    ttlSeconds: number,
  ): Promise<string>;
  remove(bucket: string, paths: string[]): Promise<void>;
  list(
    bucket: string,
    prefix: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ name: string }[]>;
}
