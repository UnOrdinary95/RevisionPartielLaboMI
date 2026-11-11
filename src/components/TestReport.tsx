import { useState } from 'react'
import { ChevronDown, CircleCheck, CircleX } from 'lucide-react'
import type { TestReport as Report } from '@/runner/python'
import { cn } from '@/lib/utils'

function Panel({ ok, title, children, defaultOpen }: { ok: boolean; title: string; children?: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className={cn('rounded-lg border', ok ? 'border-emerald-600/40 bg-emerald-500/5' : 'border-red-600/40 bg-red-500/5')}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium"
        disabled={!children}
      >
        {children && <ChevronDown className={cn('size-4 transition-transform', !open && '-rotate-90')} />}
        <span className="flex-1">{title}</span>
        {ok ? <CircleCheck className="size-5 text-emerald-500" /> : <CircleX className="size-5 text-red-500" />}
      </button>
      {open && children && <div className="border-t border-border/60 px-3 py-2">{children}</div>}
    </div>
  )
}

export function TestReport({ report }: { report: Report }) {
  const execOk = report.phase === 'ok'
  const passed = report.tests.filter((t) => t.ok).length
  const total = report.tests.length
  const pct = total ? Math.round((100 * passed) / total) : 0
  return (
    <div className="space-y-2">
      <Panel ok={execOk} title={`Exécution : ${execOk ? 'OK' : report.phase === 'syntax' ? 'erreur de syntaxe' : report.phase === 'timeout' ? 'temps dépassé' : 'erreur'}`} defaultOpen={!execOk}>
        {report.error && <pre className="whitespace-pre-wrap font-mono text-xs text-red-300">{report.error}</pre>}
      </Panel>
      {execOk && (
        <Panel ok={passed === total} title={`Tests : ${pct} % (${passed}/${total})`} defaultOpen={passed !== total}>
          <ul className="space-y-1.5">
            {report.tests.map((t, i) => (
              <li key={i} className="flex gap-2 text-xs">
                {t.ok ? <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> : <CircleX className="mt-0.5 size-3.5 shrink-0 text-red-500" />}
                <div className="min-w-0 flex-1 font-mono">
                  <div className="break-all">{t.label}</div>
                  {!t.ok && (
                    <div className="mt-0.5 space-y-0.5 text-muted-foreground">
                      {t.error ? (
                        <div className="text-red-300">{t.error}</div>
                      ) : (
                        <>
                          <div>obtenu : <span className="text-red-300">{t.got}</span></div>
                          {t.expected !== null && <div>attendu : <span className="text-emerald-300">{t.expected}</span></div>}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {execOk && report.forbidden.length > 0 && (
        <Panel ok={false} title={`Contraintes : interdit utilisé (${report.forbidden.join(', ')}), note divisée par 2`} />
      )}
      {execOk && report.forbidden.length === 0 && <Panel ok title="Contraintes : respectées" />}
    </div>
  )
}
