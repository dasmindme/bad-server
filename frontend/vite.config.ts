import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    svgr(),
    react(),
    tsconfigPaths({ root: __dirname }),
  ],
  resolve: {
    alias: {
      $fonts: resolve(__dirname, 'src/vendor/fonts'),
      $assets: resolve(__dirname, 'src/assets'),
    },
  },
  build: {
    assetsInlineLimit: 0,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "./src/scss/variables" as *;
          @use "./src/scss/mixins";
        `,
        loadPaths: [__dirname],
      },
    },
  },
});