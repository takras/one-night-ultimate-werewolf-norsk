import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project sites are served from /<repo-name>/, not the domain
// root - only apply that prefix for the production build, dev stays at /
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/one-night-ultimate-werewolf-norsk/" : "/",
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
}));
