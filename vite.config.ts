import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias: { remotion: new URL("./src/remotion-shim.ts", import.meta.url).pathname } },
  build: { assetsInlineLimit: 100000000, chunkSizeWarningLimit: 4000 },
});
