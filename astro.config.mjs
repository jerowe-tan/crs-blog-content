// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import cloudflare from '@astrojs/cloudflare';


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
  },

  server: {
    port: 5555,
    host: true
  },

  integrations: [],
  adapter: cloudflare()
});