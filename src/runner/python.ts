import type { TestSpec } from '@/content/types'

export type RunResult = { ok: boolean; stdout: string; error: string | null }
export type TestResult = {
  label: string
  ok: boolean
  got: string | null
  expected: string | null
  error: string | null
}
export type TestReport = {
  phase: 'ok' | 'syntax' | 'runtime' | 'timeout' | 'loader'
  error: string | null
  stdout: string
  tests: TestResult[]
  forbidden: string[]
  score: number
}

const TIMEOUT_MS = 6000

type Pending = { resolve: (v: string) => void; reject: (e: Error) => void; timer: number }

let worker: Worker | null = null
let seq = 0
const pending = new Map<number, Pending>()
let readyListeners: ((s: PyStatus) => void)[] = []
export type PyStatus = 'idle' | 'loading' | 'ready' | 'error'
let status: PyStatus = 'idle'

function setStatus(s: PyStatus) {
  status = s
  readyListeners.forEach((l) => l(s))
}

export function onPyStatus(l: (s: PyStatus) => void) {
  readyListeners.push(l)
  l(status)
  return () => {
    readyListeners = readyListeners.filter((x) => x !== l)
  }
}

function spawn() {
  worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (e) => {
    const d = e.data
    if (d.kind === 'ready') return setStatus('ready')
    if (d.kind === 'load-error') return setStatus('error')
    const p = pending.get(d.id)
    if (!p) return
    clearTimeout(p.timer)
    pending.delete(d.id)
    if (d.ok) p.resolve(d.result)
    else p.reject(new Error(d.error))
  }
  setStatus('loading')
  worker.postMessage({ kind: 'warmup' })
}

export function warmup() {
  if (!worker) spawn()
}

function call(kind: 'run' | 'test', payload: object): Promise<string> {
  if (!worker) spawn()
  const id = ++seq
  return new Promise((resolve, reject) => {
    // le chargement initial peut être long : pas de timeout tant que Pyodide n'est pas prêt
    const ms = status === 'ready' ? TIMEOUT_MS : 60000
    const timer = window.setTimeout(() => {
      pending.delete(id)
      worker?.terminate()
      worker = null
      pending.forEach((p) => p.reject(new Error('restart')))
      pending.clear()
      spawn()
      reject(new Error('timeout'))
    }, ms)
    pending.set(id, { resolve, reject, timer })
    worker!.postMessage({ id, kind, payload: JSON.stringify(payload) })
  })
}

export async function runCode(code: string, setup?: string): Promise<RunResult> {
  try {
    return JSON.parse(await call('run', { code, setup }))
  } catch (e) {
    const msg = (e as Error).message
    return {
      ok: false,
      stdout: '',
      error: msg === 'timeout' ? `Temps dépassé (${TIMEOUT_MS / 1000} s) : boucle infinie ?` : msg,
    }
  }
}

export async function runTests(
  code: string,
  tests: TestSpec[],
  forbid?: string[],
  setup?: string,
): Promise<TestReport> {
  try {
    return JSON.parse(await call('test', { code, tests, forbid, setup }))
  } catch (e) {
    const msg = (e as Error).message
    return {
      phase: msg === 'timeout' ? 'timeout' : 'loader',
      error: msg === 'timeout' ? `Temps dépassé (${TIMEOUT_MS / 1000} s) : boucle infinie ?` : msg,
      stdout: '',
      tests: [],
      forbidden: [],
      score: 0,
    }
  }
}
