import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "axios",
      "zustand",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "zod",
      "dayjs",
      "jwt-decode",
      "lucide-react",
      "react-hot-toast",
    ],
  },

  define: {
    "process.env": {},
  },

  server: {
    port: 3000,
  },

  build: {
    outDir: "dist",
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "chunk-react":  ["react", "react-dom", "react-router-dom"],
          "chunk-state":  ["zustand", "@tanstack/react-query"],
          "chunk-ui":     ["lucide-react", "react-hot-toast"],
          "chunk-form":   ["react-hook-form", "@hookform/resolvers", "zod"],
          "chunk-utils":  ["axios", "dayjs", "jwt-decode"],
        },
      },
    },
  },
});
