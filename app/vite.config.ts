import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy the mock API so the client calls relative URLs (no CORS in dev, no hardcoded origin).
    // The bypass lets browser navigation (Accept: text/html) fall through to Vite's SPA
    // handling, so refreshing at /sessions serves index.html instead of the API's JSON.
    proxy: {
      '/videos': { target: 'http://localhost:4000', bypass },
      '/jobs': { target: 'http://localhost:4000', bypass },
      '/headsets': { target: 'http://localhost:4000', bypass },
      '/audiences': { target: 'http://localhost:4000', bypass },
      '/sessions': { target: 'http://localhost:4000', bypass },
      '/thumbnails': { target: 'http://localhost:4000', bypass },
      '/health': { target: 'http://localhost:4000', bypass },
    },
  },
})

// Skip the proxy for browser navigation requests (HTML), so SPA routes like
// /sessions serve index.html instead of being forwarded to the API.
function bypass(req) {
  if (req.headers.accept?.includes('text/html')) return req.url;
}
