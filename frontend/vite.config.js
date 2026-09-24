import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Config de Vite: expone el dev server en la red del WSL (0.0.0.0)
// para poder abrirlo desde el navegador de Windows.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
