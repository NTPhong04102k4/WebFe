import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import requirePlugin from "vite-plugin-require";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), requirePlugin()],

  // Pre-bundle tất cả dep nặng → tránh Vite phải discover & bundle lúc runtime
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "@tanstack/react-query",
      "axios",
      "moment",
      "lodash",
      "chart.js",
      "react-chartjs-2",
      "leaflet",
      "react-leaflet",
      "styled-components",
      "react-hook-form",
      "@hookform/resolvers/yup",
      "@hookform/resolvers/zod",
      "yup",
      "zod",
      "crypto-js",
      "jwt-decode",
      "lucide-react",
    ],
  },

  // Safety net: một số thư viện third-party vẫn dùng process.env
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
    // Tách chunk theo nhóm → browser cache tốt hơn, initial load nhỏ hơn
    rollupOptions: {
      output: {
        manualChunks: {
          "chunk-react":   ["react", "react-dom", "react-router-dom"],
          "chunk-state":   ["react-redux", "@reduxjs/toolkit", "@tanstack/react-query"],
          "chunk-ui":      ["styled-components", "lucide-react"],
          "chunk-form":    ["react-hook-form", "@hookform/resolvers", "yup", "zod"],
          "chunk-chart":   ["chart.js", "react-chartjs-2"],
          "chunk-map":     ["leaflet", "react-leaflet"],
          "chunk-editor":  ["tinymce"],
          "chunk-utils":   ["axios", "moment", "lodash", "crypto-js", "jwt-decode"],
        },
      },
    },
  },

});
