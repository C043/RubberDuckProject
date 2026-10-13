// Renders a preview of every model into public/models/thumbs/ using headless Chromium.
// Usage: npm run thumbs [-- <model-id>,<model-id>]   (CHROME=/path/to/chrome to override)
import { spawn, execSync } from 'node:child_process'
import { createServer } from 'vite'

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME
  for (const bin of ['chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome']) {
    try {
      return execSync(`command -v ${bin}`, { encoding: 'utf8' }).trim()
    } catch {
      // try the next one
    }
  }
  throw new Error('Chromium/Chrome not found; set CHROME=/path/to/browser')
}

const only = process.argv[2]
const server = await createServer({ server: { port: 0 }, logLevel: 'warn' })
await server.listen()
const url = new URL('/thumbs.html', server.resolvedUrls.local[0])
if (only) url.searchParams.set('only', only)

const chrome = spawn(findChrome(), [
  '--headless=new',
  '--enable-unsafe-swiftshader',
  '--use-angle=swiftshader',
  '--window-size=512,512',
  '--remote-debugging-port=0',
  '--enable-logging=stderr',
  '--v=0',
  `--user-data-dir=${process.env.TMPDIR ?? '/tmp'}/duck-thumbs-${process.pid}`,
  url.href,
])

const finished = new Promise((resolveDone, reject) => {
  const timeout = setTimeout(() => reject(new Error('Timed out after 5 minutes')), 5 * 60_000)
  chrome.stderr.on('data', (data) => {
    for (const line of String(data).split('\n')) {
      const msg = line.match(/CONSOLE.*?"(.*?)"/)?.[1]
      if (!msg) continue
      console.log(msg)
      if (msg === 'thumbs done') {
        clearTimeout(timeout)
        resolveDone()
      } else if (/error|failed/i.test(msg)) {
        clearTimeout(timeout)
        reject(new Error(msg))
      }
    }
  })
  chrome.on('exit', (code) => reject(new Error(`Browser exited early (${code})`)))
})

try {
  await finished
} finally {
  chrome.kill()
  await server.close()
}
