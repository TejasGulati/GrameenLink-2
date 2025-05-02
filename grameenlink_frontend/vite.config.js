import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // correct base path for Vercel
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: "dist", // default for Vite but good to be explicit for Vercel
    emptyOutDir: true
  }
});
