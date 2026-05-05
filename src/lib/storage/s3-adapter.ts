import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageAdapter } from "./adapter";

const LIST_PAGE_SIZE = 1000;
const DELETE_BATCH_SIZE = 1000;

function normalizeListPrefix(prefix: string): string {
  if (prefix === "") return ""
  return prefix.endsWith("/") ? prefix : `${prefix}/`
}

function objectRelativeName(key: string, listPrefix: string): string {
  if (!listPrefix) return key
  if (!key.startsWith(listPrefix)) return key
  return key.slice(listPrefix.length)
}

export function createS3ClientFromEnv(): S3Client {
  const region = process.env.S3_REGION?.trim()
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim()
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY are required for S3 storage",
    )
  }
  const endpoint = process.env.S3_ENDPOINT?.trim() || undefined
  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    // Set S3_FORCE_PATH_STYLE=true for many MinIO / Garage deployments; leave unset for AWS and R2.
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  })
}

export function createS3StorageAdapter(client: S3Client): StorageAdapter {
  return {
    async upload(bucket, path, body, options) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: path,
          Body: body,
          ContentType: options.contentType,
        }),
      )
    },

    async download(bucket, path) {
      const response = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: path }),
      )
      const body = response.Body
      if (!body) {
        throw new Error("S3 GetObject returned empty body")
      }
      const bytes = await body.transformToByteArray()
      return Buffer.from(bytes)
    },

    async createSignedUrl(bucket, path, ttlSeconds) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: path })
      return getSignedUrl(client, command, { expiresIn: ttlSeconds })
    },

    async remove(bucket, paths) {
      if (paths.length === 0) return
      for (let i = 0; i < paths.length; i += DELETE_BATCH_SIZE) {
        const batch = paths.slice(i, i + DELETE_BATCH_SIZE)
        const deleteResult = await client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: batch.map((Key) => ({ Key })),
              Quiet: true,
            },
          }),
        )
        const failures = deleteResult.Errors ?? []
        if (failures.length > 0) {
          throw new Error(
            failures
              .map((e) => `${e.Key ?? "?"}: ${e.Message ?? "delete failed"}`)
              .join("; "),
          )
        }
      }
    },

    async list(bucket, prefix, options) {
      const limit = options?.limit ?? LIST_PAGE_SIZE
      const offset = options?.offset ?? 0
      const listPrefix = normalizeListPrefix(prefix)

      let continuationToken: string | undefined
      let skipped = 0
      const out: { name: string }[] = []

      while (skipped < offset || out.length < limit) {
        const page = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: listPrefix,
            MaxKeys: LIST_PAGE_SIZE,
            ContinuationToken: continuationToken,
          }),
        )

        const contents = page.Contents ?? []
        continuationToken = page.IsTruncated
          ? page.NextContinuationToken
          : undefined

        for (const obj of contents) {
          const key = obj.Key
          if (!key) continue

          const name = objectRelativeName(key, listPrefix)
          if (name === "") continue

          if (skipped < offset) {
            skipped++
            continue
          }

          out.push({ name })

          if (out.length >= limit) {
            return out
          }
        }

        if (!continuationToken) {
          break
        }
      }

      return out
    },
  }
}
