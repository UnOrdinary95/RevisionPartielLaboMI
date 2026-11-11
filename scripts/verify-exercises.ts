import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { ALL_EXERCISES } from '../src/content'

const dir = mkdtempSync(path.join(tmpdir(), 'labomi-'))
const file = path.join(dir, 'bank.json')
writeFileSync(file, JSON.stringify(ALL_EXERCISES))
try {
  execFileSync('python3', [path.join(import.meta.dirname, 'verify.py'), file], { stdio: 'inherit' })
} catch {
  process.exit(1)
}
