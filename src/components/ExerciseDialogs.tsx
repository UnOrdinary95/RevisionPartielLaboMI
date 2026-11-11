import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Markdown } from './Markdown'
import { CodeEditor } from './CodeEditor'
import type { Exercise } from '@/content/types'
import type { ItemState } from '@/store/progress'

export function AnswersDialog({ ex, item, open, onOpenChange }: { ex: Exercise; item: ItemState; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mes réponses · {ex.title}</DialogTitle>
        </DialogHeader>
        {item.attempts.length === 0 && <p className="text-sm text-muted-foreground">Aucune réponse envoyée.</p>}
        <div className="space-y-4">
          {item.attempts.map((a, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Réponse {i + 1}</span>
                <span>{new Date(a.at).toLocaleString('fr-FR')}</span>
                <span className="ml-auto tabular-nums">
                  {a.score === null ? 'non auto-évaluée' : `${a.score}/100`}
                  {a.total !== undefined && ` · ${a.passed}/${a.total} tests`}
                </span>
              </div>
              {ex.kind === 'code' ? (
                <CodeEditor value={a.answer} readOnly minHeight="0" />
              ) : (
                <div className="rounded-lg border border-border p-3">
                  <Markdown>{a.answer || '*Vide*'}</Markdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SolutionDialog({ ex, open, onOpenChange }: { ex: Exercise; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Correction · {ex.title}</DialogTitle>
        </DialogHeader>
        <details className="rounded-lg border border-border px-3 py-2 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Énoncé</summary>
          <Markdown>{ex.statement}</Markdown>
        </details>
        {ex.answer && (
          <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/5 px-3 py-2">
            <Markdown>{ex.answer}</Markdown>
          </div>
        )}
        <Markdown>{ex.solution}</Markdown>
      </DialogContent>
    </Dialog>
  )
}
