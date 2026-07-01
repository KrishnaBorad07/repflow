import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'RepFlow — AI Fitness Assistant',
        short_name: 'RepFlow',
        description: 'Your AI-powered training partner. Personalized plans, real-time form feedback, and a coach in your pocket.',
        theme_color: '#0A0B0D',
        background_color: '#0A0B0D',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  resolve: {
    alias: {
      // @tensorflow-models/pose-detection statically imports `Pose` from
      // @mediapipe/pose for BlazePose. The mediapipe package is a global
      // script with no named ESM exports, so the import errors at runtime.
      // We only ship MoveNet, so redirect the dependency to a local stub.
      '@mediapipe/pose': fileURLToPath(new URL('./shims/mediapipe-pose.js', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
