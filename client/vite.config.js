import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 시 프론트(5173)에서 /api 요청을 백엔드(3001)로 프록시합니다.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
