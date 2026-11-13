import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { BANK } from '../src/content'

const dir = mkdtempSync(path.join(tmpdir(), 'labomi-'))
const file = path.join(dir, 'bank.json')
writeFileSync(file, JSON.stringify(BANK))
try {
  execFileSync('python3', [path.join(import.meta.dirname, 'verify.py'), file], { stdio: 'inherit' })
} catch {
  process.exit(1)
}
