import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    envPrefix: ['REACT_APP_', 'VITE_'],
    plugins: [react()],
  };
});
