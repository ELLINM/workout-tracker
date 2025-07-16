// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // Remove the rewrite rule, or explicitly return the original path.
        // This ensures '/api/workouts' is sent as '/api/workouts' to the backend.
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              `[Vite Proxy Request] Method: ${req.method}, Original URL: ${req.url}, Proxied Path: ${proxyReq.path}`
            );
          });
          proxy.on("error", (err, req, res) => {
            console.error(`[Vite Proxy Error] ${err.message}`);
          });
        },
      },
    },
  },
});
