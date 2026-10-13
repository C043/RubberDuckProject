import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Dev-only endpoint used by thumbs.html to save model previews.
function thumbnailWriter(): Plugin {
  const dir = resolve(import.meta.dirname, 'public/models/thumbs')
  return {
    name: 'thumbnail-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__thumbs/', async (req, res) => {
        const id = req.url?.slice(1) ?? ''
        if (req.method !== 'POST' || !/^[a-z0-9-]+$/.test(id)) {
          res.statusCode = 400
          res.end()
          return
        }
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        await mkdir(dir, { recursive: true })
        await writeFile(resolve(dir, `${id}.webp`), Buffer.concat(chunks))
        res.end('ok')
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), thumbnailWriter()],
})
