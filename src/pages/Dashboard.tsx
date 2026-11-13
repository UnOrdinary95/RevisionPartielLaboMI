import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { FolderPlus, Play } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SolutionDialog } from '@/components/ExerciseDialogs'
import { Stars } from '@/components/StatusIcon'
import { ALL_EXERCISES, EXERCISES_BY_ID } from '@/content'
import { PROBLEMS, type Problem } from '@/content/types'
import { computeStats, formatDuration, isWeak, useProgress, type ExerciseStats } from '@/store/progress'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'weak' | 'mastered' | 'never'

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

function Bar({ label, stats, ids }: { label: string; stats: Record<string, ExerciseStats>; ids: string[] }) {
  const mastered = ids.filter((id) => stats[id].mastered).length
  const weak = ids.filter((id) => isWeak(stats[id])).length
  const n = ids.length
  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{mastered}/{n} maîtrisés</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div className="bg-emerald-500" style={{ width: `${(100 * mastered) / n}%` }} />
        <div className="bg-red-500/80" style={{ width: `${(100 * weak) / n}%` }} />
      </div>
      <div className="flex gap-3 text-[11px] text-muted-foreground">
        <span><span className="text-emerald-400">■</span> maîtrisés {mastered}</span>
        <span><span className="text-red-400">■</span> à retravailler {weak}</span>
        <span>■ jamais faits {n - mastered - weak}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const { sessions, createGroup, launch } = useProgress()
  const stats = useMemo(() => computeStats(sessions), [sessions])
  const [problem, setProblem] = useState<0 | Problem>(0)
  const [filter, setFilter] = useState<Filter>('all')
  const [kind, setKind] = useState<'all' | 'code' | 'math'>('all')
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [sol, setSol] = useState<string | null>(null)

  const rows = ALL_EXERCISES.filter((e) => {
    const st = stats[e.id]
    if (problem && e.problem !== problem) return false
    if (kind !== 'all' && e.kind !== kind) return false
    if (filter === 'weak' && !isWeak(st)) return false
    if (filter === 'mastered' && !st.mastered) return false
    if (filter === 'never' && st.attempts > 0) return false
    return true
  }).sort((a, b) => {
    // faiblesse : ratés d'abord (note croissante), puis jamais faits, puis maîtrisés
    const sa = stats[a.id], sb = stats[b.id]
    const rank = (s: ExerciseStats) => (isWeak(s) ? 0 : s.attempts === 0 ? 1 : 2)
    return rank(sa) - rank(sb) || (sa.lastScore ?? 0) - (sb.lastScore ?? 0) || sb.attempts - sa.attempts || b.stars - a.stars
  })

  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const weakIds = ALL_EXERCISES.filter((e) => isWeak(stats[e.id])).map((e) => e.id)
  const totalTime = Object.values(stats).reduce((a, s) => a + s.timeMs, 0)
  const tried = Object.values(stats).filter((s) => s.attempts > 0).length

  const makeGroup = (ids: string[], def: string) => {
    if (!ids.length) return
    const name = prompt('Nom du groupe ?', def)
    if (!name) return
    const id = createGroup(name, ids)
    setSel(new Set())
    toast.success(`Groupe « ${name} » créé`, { action: { label: 'Lancer', onClick: () => nav(`/s/${launch('custom:' + id)}/0`) } })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-3 sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {tried}/{ALL_EXERCISES.length} exercices tentés · {formatDuration(totalTime)} d’entraînement · « maîtrisé » = dernière note ≥ 80
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Button size="sm" variant="outline" disabled={!weakIds.length} onClick={() => makeGroup(weakIds, 'Non maîtrisés')}>
            <FolderPlus className="size-3.5" /> Grouper les non maîtrisés ({weakIds.length})
          </Button>
          <Button size="sm" disabled={!weakIds.length} onClick={() => nav(`/s/${useProgress.getState().restart('weak')}/0`)}>
            <Play className="size-3.5" /> S’entraîner sur les non maîtrisés
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {([1, 2, 3] as Problem[]).map((p) => (
          <Bar key={p} label={`P${p} · ${PROBLEMS[p].short}`} stats={stats} ids={ALL_EXERCISES.filter((e) => e.problem === p).map((e) => e.id)} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[3, 2].map((n) => (
          <Bar key={n} label={`${'★'.repeat(n)} ${n === 3 ? 'très probable' : 'probable'}`} stats={stats} ids={ALL_EXERCISES.filter((e) => e.stars === n).map((e) => e.id)} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Seg value={problem} onChange={setProblem} options={[[0, 'Tous'], [1, 'P1'], [2, 'P2'], [3, 'P3']]} />
        <Seg value={filter} onChange={setFilter} options={[['all', 'Tous'], ['weak', 'À retravailler'], ['never', 'Jamais faits'], ['mastered', 'Maîtrisés']]} />
        <Seg value={kind} onChange={setKind} options={[['all', 'Code + maths'], ['code', 'Code'], ['math', 'Maths']]} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{sel.size} sélectionné(s)</span>
          <Button size="sm" variant="outline" disabled={!sel.size} onClick={() => makeGroup([...sel], 'Mon groupe')}>
            <FolderPlus className="size-3.5" /> Créer un groupe
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table className="[&_td]:px-1.5 [&_th]:px-1.5 sm:[&_td]:px-2 sm:[&_th]:px-2">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-8">
                <Checkbox
                  checked={rows.length > 0 && rows.every((r) => sel.has(r.id))}
                  onCheckedChange={(c) => setSel(c ? new Set(rows.map((r) => r.id)) : new Set())}
                />
              </TableHead>
              <TableHead>Exercice</TableHead>
              <TableHead className="hidden text-center sm:table-cell">Proba</TableHead>
              <TableHead className="hidden text-center sm:table-cell">Tentatives</TableHead>
              <TableHead className="hidden text-center sm:table-cell">Temps</TableHead>
              <TableHead className="text-center"><span className="sm:hidden">Note</span><span className="hidden sm:inline">Dernière note</span></TableHead>
              <TableHead className="text-center">État</TableHead>
              <TableHead className="hidden sm:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => {
              const st = stats[e.id]
              return (
                <TableRow key={e.id} data-state={sel.has(e.id) ? 'selected' : undefined}>
                  <TableCell><Checkbox checked={sel.has(e.id)} onCheckedChange={() => toggle(e.id)} /></TableCell>
                  <TableCell>
                    <div className="font-medium whitespace-normal">{e.title}</div>
                    <div className="text-xs whitespace-normal text-muted-foreground">P{e.problem} · {e.kind === 'code' ? 'Code' : 'Maths'}{e.source ? ` · ${e.source}` : ''}</div>
                  </TableCell>
                  <TableCell className="hidden text-center sm:table-cell"><Stars n={e.stars} /></TableCell>
                  <TableCell className="hidden text-center tabular-nums sm:table-cell">{st.attempts}</TableCell>
                  <TableCell className="hidden text-center tabular-nums sm:table-cell">{st.timeMs ? formatDuration(st.timeMs) : '—'}</TableCell>
                  <TableCell className="text-center font-medium tabular-nums">{st.lastScore ?? '—'}</TableCell>
                  <TableCell className="text-center">
                    {st.mastered ? (
                      <Badge variant="outline" className="border-emerald-600/50 text-emerald-400">Maîtrisé</Badge>
                    ) : isWeak(st) ? (
                      <Badge variant="outline" className="border-red-600/50 text-red-400">À retravailler</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Jamais fait</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <Button size="xs" variant="ghost" disabled={!st.attempts} onClick={() => setSol(e.id)} title={st.attempts ? '' : 'Fais l’exercice avant'}>
                      Correction
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {sol && <SolutionDialog ex={EXERCISES_BY_ID[sol]} open onOpenChange={(o) => !o && setSol(null)} />}
    </div>
  )
}
