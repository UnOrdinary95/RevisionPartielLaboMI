import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/Markdown'
import { Stars } from '@/components/StatusIcon'
import { ALL_EXERCISES } from '@/content'
import { PROBLEMS, type Exercise, type Problem } from '@/content/types'
import { computeStats, isWeak, useProgress } from '@/store/progress'
import { cn } from '@/lib/utils'

type Kind = 'all' | 'code' | 'math'
type Status = 'all' | 'weak' | 'never' | 'mastered'

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
      {options.map(([v, l]) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={cn('rounded-md px-2.5 py-1 text-muted-foreground transition-colors', value === v && 'bg-muted text-foreground')}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

/** Une fiche d'exercice : titre toujours visible, énoncé + correction au toucher */
function Card({ ex }: { ex: Exercise }) {
  const [open, setOpen] = useState(false)
  const [statement, setStatement] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 px-3 py-3 text-left sm:px-4">
        <div className="min-w-0 flex-1">
          <div className="font-medium">{ex.title}</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="h-4 px-1 text-[10px]">{ex.kind === 'code' ? 'Code' : 'Maths'}</Badge>
            <Stars n={ex.stars} />
          </div>
        </div>
        <ChevronDown className={cn('mt-1 size-4 shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setStatement((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn('size-3.5 transition-transform', !statement && '-rotate-90')} /> Énoncé
          </button>
          {statement && (
            <div className="rounded-lg border border-border bg-muted/20 px-3">
              <Markdown>{ex.statement}</Markdown>
            </div>
          )}
          {ex.reminder && statement && (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-3">
              <Markdown>{ex.reminder}</Markdown>
            </div>
          )}
          {ex.answer && (
            <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/5 px-3 py-1">
              <div className="pt-1 text-xs font-medium text-emerald-400">Réponse</div>
              <Markdown>{ex.answer}</Markdown>
            </div>
          )}
          <Markdown>{ex.solution}</Markdown>
        </div>
      )}
    </div>
  )
}

export default function Revision() {
  const [problem, setProblem] = useState<0 | Problem>(0)
  const [kind, setKind] = useState<Kind>('all')
  const [status, setStatus] = useState<Status>('all')
  const [stars, setStars] = useState<0 | 2 | 3>(0)
  const [q, setQ] = useState('')
  const sessions = useProgress((s) => s.sessions)
  const stats = useMemo(() => computeStats(sessions), [sessions])

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = ALL_EXERCISES.filter((e) => {
      const st = stats[e.id]
      if (problem && e.problem !== problem) return false
      if (kind !== 'all' && e.kind !== kind) return false
      if (stars && e.stars !== stars) return false
      if (status === 'weak' && !isWeak(st)) return false
      if (status === 'mastered' && !st.mastered) return false
      if (status === 'never' && st.attempts > 0) return false
      return !needle || e.title.toLowerCase().includes(needle) || e.tags.some((t) => t.includes(needle))
    }).sort((a, b) => b.stars - a.stars || (a.kind === b.kind ? 0 : a.kind === 'code' ? -1 : 1))
    return ([1, 2, 3] as Problem[]).map((p) => ({ p, items: list.filter((e) => e.problem === p) })).filter((g) => g.items.length)
  }, [problem, kind, stars, status, q, stats])

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-3 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Révision</h1>
        <p className="text-sm text-muted-foreground">Toutes les corrections, à relire vite. Touche un exercice pour l’ouvrir.</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Seg value={problem} onChange={setProblem} options={[[0, 'Tous'], [1, 'P1'], [2, 'P2'], [3, 'P3']]} />
        <Seg value={kind} onChange={setKind} options={[['all', 'Tout'], ['code', 'Code'], ['math', 'Maths']]} />
        <Seg value={stars} onChange={setStars} options={[[0, 'Toutes probas'], [3, '★★★'], [2, '★★']]} />
        <Seg value={status} onChange={setStatus} options={[['all', 'Tous'], ['weak', 'À retravailler'], ['never', 'Jamais faits'], ['mastered', 'Maîtrisés']]} />
        <label className="flex min-w-40 flex-1 items-center gap-2 rounded-lg border border-border px-2.5 py-1">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (Horner, Rat…)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {groups.length === 0 && <p className="text-sm text-muted-foreground">Aucun exercice ne correspond.</p>}
      {groups.map(({ p, items }) => (
        <section key={p} className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            P{p} · {PROBLEMS[p].short} <span className="tabular-nums">({items.length})</span>
          </h2>
          <div className="space-y-2">
            {items.map((e) => (
              <Card key={e.id} ex={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
