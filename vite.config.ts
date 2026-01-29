/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import apiPlugin from './server/viteApiPlugin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    Object.assign(process.env, env);
    return {
      server: {
        port: 3011,
        host: '0.0.0.0',
      },
      plugins: [apiPlugin(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          buffer: path.resolve(__dirname, 'node_modules/buffer/'),
        }
      },
      optimizeDeps: {
        include: ['buffer', '@solana/spl-token', '@solana/web3.js'],
        esbuildOptions: {
          define: {
            global: 'globalThis',
          },
        },
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        css: true,
      },
    };
});
