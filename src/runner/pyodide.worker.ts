/// <reference lib="webworker" />
import harness from './harness.py?raw'

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.mjs'

type Req = { id: number; kind: 'run' | 'test'; payload: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyPromise: Promise<any> | null = null

function getPy() {
  if (!pyPromise) {
    pyPromise = (async () => {
      const mod = await import(/* @vite-ignore */ PYODIDE_URL)
      const py = await mod.loadPyodide()
      py.runPython(harness)
      return py
    })()
  }
  return pyPromise
}

self.onmessage = async (e: MessageEvent<Req | { kind: 'warmup' }>) => {
  const msg = e.data
  if (msg.kind === 'warmup') {
    try {
      await getPy()
      self.postMessage({ kind: 'ready' })
    } catch (err) {
      self.postMessage({ kind: 'load-error', error: String(err) })
    }
    return
  }
  try {
    const py = await getPy()
    const fn = py.globals.get(msg.kind === 'run' ? 'run_code' : 'run_tests')
    const out: string = fn(msg.payload)
    fn.destroy?.()
    self.postMessage({ id: msg.id, ok: true, result: out })
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: String(err) })
  }
}
