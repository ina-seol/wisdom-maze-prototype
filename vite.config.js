import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/wisdom-maze-prototype/",

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html")
      }
    }
  }
});
