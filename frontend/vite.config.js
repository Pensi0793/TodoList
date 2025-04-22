import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Đảm bảo đường dẫn đúng khi triển khai
  server: {
    proxy: {
      '/api': {
        target: 'https://todolist-h26x.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
