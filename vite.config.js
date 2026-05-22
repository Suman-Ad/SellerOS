import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        maximumFileSizeToCacheInBytes: 10000000, // 10 MB
      },

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "SellerOS ERP",
        short_name: "SellerOS",

        description:
          "Modern Seller ERP & Commerce Management Platform",

        theme_color: "#0f172a",
        background_color: "#0f172a",

        display: "standalone",

        scope: "/",
        start_url: "/",

        orientation: "portrait",

        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },

          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },

          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});