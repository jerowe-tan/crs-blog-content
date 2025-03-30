// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import cloudflare from '@astrojs/cloudflare';
import sitemap from "@astrojs/sitemap";


// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },

  output: 'server',

  prefetch: {
    defaultStrategy: 'viewport'
  },

  image: {
    domains: ["cdn.tmsph.app"],
    remotePatterns: [{ protocol: "https" }],
  },

  vite: {
    ssr: {
      external: ['node:buffer'],
    },
    plugins: [tailwindcss()],
    define:{
      'process.env.SECRET_TURSO_CRS_CONTENT_TOKEN':JSON.stringify(process.env.SECRET_TURSO_CRS_CONTENT_TOKEN),
      'process.env.SECRET_TURSO_CRS_CONTENT_URL':JSON.stringify(process.env.SECRET_TURSO_CRS_CONTENT_URL),

      'process.env.SECRET_S3_ENDPOINT':JSON.stringify(process.env.SECRET_S3_ENDPOINT),
      'process.env.SECRET_R2_ACCESS_ID':JSON.stringify(process.env.SECRET_R2_ACCESS_ID),
      'process.env.SECRET_R2_SECRET_ACCESS_KEY':JSON.stringify(process.env.SECRET_R2_SECRET_ACCESS_KEY),
      'process.env.SECRET_R2_BUCKET_BLOG_NAME':JSON.stringify(process.env.SECRET_R2_BUCKET_BLOG_NAME),

    }
  },

  server: {
    port: 9669,
    host: true
  },

  integrations: [sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en-PH'
      }
    }
  })],
  adapter: cloudflare(),
});