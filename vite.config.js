import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/bikeworld3d/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        inspector: resolve(__dirname, "inspector.html"),
      },
    },
  },
});
