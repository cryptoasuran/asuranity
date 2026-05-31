import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/vanity-generator/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-crypto': ['ethers', '@solana/web3.js', '@mysten/sui.js'],
          'vendor-ui': ['framer-motion', 'recharts', 'zustand']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@mysten/sui.js']
  },
  worker: {
    format: 'es'
  }
});
