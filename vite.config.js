import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The old Vercel-emulation dev plugin (vite-api-plugin.js) is gone — it
// emulated /api on top of plain Node + local disk, neither of which match
// how this now actually runs (Cloudflare Pages Functions + R2). Local dev
// against the real API is `wrangler pages dev --proxy 5173 -- npm run dev`
// (see README.md), which runs this Vite dev server AND functions/ together,
// so there's nothing left for Vite itself to emulate.
export default defineConfig({
  plugins: [react()],
})
