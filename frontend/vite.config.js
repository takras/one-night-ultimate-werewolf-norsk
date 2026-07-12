import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served at the custom domain root (werewolf.takras.net/), not a GitHub
// Pages project subpath - CNAME lives in public/ so the build bundles it
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
