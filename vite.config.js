// Vite config for Arabic Boolean Query Builder.
//
// Output is a single self-contained `dist/index.html` that opens via file://
// with no runtime dependencies, no network calls, and no persistence.
// `vite-plugin-singlefile` inlines every CSS/JS chunk into the HTML.

import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
