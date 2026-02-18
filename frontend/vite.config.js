import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";

const isElectron = process.env.ELECTRON === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isElectron
      ? [
          electron([
            {
              entry: "electron/main.js",
              vite: {
                build: {
                  outDir: "dist-electron",
                  rollupOptions: { external: ["electron"] },
                },
              },
            },
            {
              entry: "electron/preload.js",
              onstart(args) {
                args.reload();
              },
              vite: {
                build: {
                  outDir: "dist-electron",
                  rollupOptions: { external: ["electron"] },
                },
              },
            },
          ]),
          electronRenderer(),
        ]
      : []),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  define: {
    "import.meta.env.VITE_API_BASE": isElectron
      ? JSON.stringify("http://localhost:8000/api")
      : JSON.stringify("/api"),
  },
});
