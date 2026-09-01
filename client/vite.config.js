import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * The API the dev server proxies /api to.
 *
 * Hardcoded to port 3000 until now, which is fine for one developer and
 * unworkable for two: a second checkout of this repo — a worktree, a branch
 * being reviewed side by side with main — cannot run its own API without
 * taking the port from the first. Overridable per shell, defaulted so nobody
 * who does not care has to set it.
 *
 *   API_PROXY_TARGET=http://localhost:3100 npm run dev
 */
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
