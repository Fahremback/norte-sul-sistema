
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      server: {
        port: 5174, // Define a porta específica para o sistema de gestão
        strictPort: true, // Falha se a porta já estiver em uso
        proxy: {
          // Adiciona proxy para o backend local, resolvendo o erro 404
          '/api': {
            target: 'https://localhost:8443', // URL do seu servidor backend local
            changeOrigin: true, // Necessário para evitar erros de CORS
            secure: false, // Permite certificados autoassinados para desenvolvimento local
          },
          // Adiciona proxy para a pasta de uploads, resolvendo o problema das imagens não aparecerem
          '/uploads': {
            target: 'https://localhost:8443',
            changeOrigin: true,
            secure: false, // Permite certificados autoassinados para desenvolvimento local
          }
        },
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});
