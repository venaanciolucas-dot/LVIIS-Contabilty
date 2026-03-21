import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  // Carregar as variáveis do .env para expor ao pacote @repo/api
  // @ts-expect-error process is a nodejs global
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],

    // Expõe as variáveis do .env como process.env para pacotes compartilhados
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  };
});

