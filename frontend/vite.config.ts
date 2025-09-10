import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@css": path.resolve(__dirname, "src/css"),
      "@services": path.resolve(__dirname, "src/services"),
      "@types": path.resolve(__dirname, "src/types"),
      "@features": path.resolve(__dirname, "src/features"),
    },
  },
});
