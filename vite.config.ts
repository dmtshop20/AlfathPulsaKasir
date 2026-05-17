import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      tailwindcss(),
      react(), 
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Alfath Pulsa Manajemen',
          short_name: 'AlfathPOS',
          description: 'Sistem Manajemen Alfath Pulsa - POS, Stok, dan Laporan Transaksi.',
          theme_color: '#1e293b',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'https://placehold.co/192x192/1e293b/white?text=Alfath\nPOS&font=inter',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://placehold.co/512x512/1e293b/white?text=Alfath\nPOS&font=inter',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'https://placehold.co/512x512/1e293b/white?text=Alfath\nPOS&font=inter',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
