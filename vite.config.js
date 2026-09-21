import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/wisdom-maze-prototype/",

  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(
          new URL("./index.html", import.meta.url)
        ),

        admin: fileURLToPath(
          new URL("./admin.html", import.meta.url)
        )
      }
    }
  }
});
