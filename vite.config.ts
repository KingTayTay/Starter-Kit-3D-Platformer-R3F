import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  base: "/Starter-Kit-3D-Platformer-R3F/",
  plugins: [react()],
  assetsInclude: ["**/*.glb", "**/*.gltf"],
});