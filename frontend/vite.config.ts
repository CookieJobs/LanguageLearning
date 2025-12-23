// input: path, vite, @vitejs/plugin-react
// output: defineConfig
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': { target: 'http://localhost:5500', changeOrigin: true }
      }
    },
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') }
    }
  };
});
