import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client/public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        '@tiptap/suggestion',
        'ace-builds/src-noconflict/mode-javascript',
        'ace-builds/src-noconflict/mode-python',
        'ace-builds/src-noconflict/mode-typescript',
        'ace-builds/src-noconflict/theme-github',
        'ace-builds/src-noconflict/theme-monokai',
        'ace-builds/src-noconflict/theme-tomorrow_night',
        'ace-builds/src-noconflict/ext-language_tools'
      ]
    }
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  worker: {
    format: 'es'
  }
}));
