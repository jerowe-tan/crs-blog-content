/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SECRET_TURSO_CRS_CONTENT_TOKEN: string;
  readonly SECRET_TURSO_CRS_CONTENT_URL: string;

  readonly SECRET_S3_ENDPOINT: string;
  readonly SECRET_R2_ACCESS_ID: string;
  readonly SECRET_R2_SECRET_ACCESS_KEY: string;
  readonly SECRET_R2_BUCKET_BLOG_NAME: string;

  readonly PUBLIC_API_AI_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}