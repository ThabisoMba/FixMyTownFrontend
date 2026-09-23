import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/grp-03-39/",

  server: {
    port: 5173,
  },
});