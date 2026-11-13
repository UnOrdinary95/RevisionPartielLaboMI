import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Play, RotateCcw, Timer, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ProgressRing'
import { ALL_EXERCISES } from '@/content'
import { STATIC_SERIES, type SeriesDef } from '@/content/series'
import {
  computeStats,
  formatDuration,
  isWeak,
  sessionProgress,
  sessionScore,
  sessionTime,
  useProgress,
} from '@/store/progress'

function SeriesCard({ def, weakCount, onDelete }: { def: SeriesDef; weakCount?: number; onDelete?: () => void }) {
  const nav = useNavigate()
  const { sessions, activeBySeries, launch, restart } = useProgress()
  const session = activeBySeries[def.id] ? sessions[activeBySeries[def.id]] : undefined
  const prog = session ? sessionProgress(session) : null
  const total = prog?.total ?? def.exerciseIds?.length ?? (def.kind === 'weak' ? weakCount ?? 0 : def.kind === 'random-mock' ? 5 : 0)
  const done = prog?.done ?? 0
  const finished = session?.status === 'finished'
  const disabled = def.kind === 'weak' && !session && !weakCount

  const go = (sid: string) => {
    const s = useProgress.getState().sessions[sid]
    if (s.exerciseIds.length === 0) {
      toast('Aucun exercice dans cette série pour l’instant.')
      return
    }
    nav(s.status === 'finished' ? `/s/${sid}/recap` : `/s/${sid}/${s.currentIndex}`)
  }

  const onRestart = () => {
    if (session && session.status === 'active' && done > 0 && !confirm('Recommencer à zéro ? La session en cours sera archivée dans l’historique.')) return
    go(restart(def.id))
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className={def.kind === 'mock' || def.kind === 'random-mock' ? 'h-2 bg-sky-500/80' : def.kind === 'weak' ? 'h-2 bg-red-500/70' : 'h-2 bg-amber-500/80'} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{def.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{def.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {def.timeLimit && (
              <Badge variant="outline" className="gap-1">
                <Timer className="size-3" /> {def.timeLimit} min
              </Badge>
            )}
            {session && (
              <Badge variant={finished ? 'secondary' : 'outline'} className={finished ? '' : 'border-emerald-600/50 text-emerald-400'}>
                {finished ? 'Terminé' : 'En cours'}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <ProgressRing value={total ? (100 * done) / total : 0} label={`${done}/${total} terminés`} />
        </div>
        <div className="grid grid-cols-2 divide-x divide-border text-center text-xs">
          <div>
            <div className="font-medium tabular-nums">{session ? `${sessionScore(session)}/100` : '—'}</div>
            <div className="text-muted-foreground">Note moyenne</div>
          </div>
          <div>
            <div className="font-medium tabular-nums">{session ? formatDuration(sessionTime(session)) : '—'}</div>
            <div className="text-muted-foreground">Temps passé</div>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
          <Button size="sm" onClick={() => go(launch(def.id))} disabled={disabled} className="bg-amber-500 text-black hover:bg-amber-400">
            <Play className="size-3.5" /> {session ? (finished ? 'Voir' : 'Continuer') : 'Lancer'}
          </Button>
          <Button size="sm" variant="outline" onClick={onRestart} disabled={disabled}>
            <RotateCcw className="size-3.5" /> Relancer
          </Button>
          {onDelete && (
            <Button size="icon-sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={onDelete} title="Supprimer le groupe">
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{children}</div>
    </section>
  )
}

export default function Home() {
  const { sessions, groups, deleteGroup } = useProgress()
  const weakCount = useMemo(() => {
    const st = computeStats(sessions)
    return ALL_EXERCISES.filter((e) => isWeak(st[e.id])).length
  }, [sessions])
  const by = (k: string) => STATIC_SERIES.filter((s) => s.kind === k)

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-3 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Entraînement · partiel Labo Math-Info</h1>
        <p className="text-sm text-muted-foreground">
          Vendredi 13 novembre, 1h sur papier. {ALL_EXERCISES.length} exercices tirés des problèmes 1 à 3 et des annales.
        </p>
      </header>
      <Section title="Par problème">
        {by('problem').map((d) => (
          <SeriesCard key={d.id} def={d} />
        ))}
      </Section>
      <Section title="Révision ciblée">
        {by('essentials').map((d) => (
          <SeriesCard key={d.id} def={d} />
        ))}
        {by('weak').map((d) => (
          <SeriesCard key={d.id} def={{ ...d, subtitle: weakCount ? `${weakCount} exercice(s) à retravailler` : 'Rien pour l’instant : fais d’abord quelques séries' }} weakCount={weakCount} />
        ))}
        {groups.map((g) => (
          <SeriesCard
            key={g.id}
            def={{ id: 'custom:' + g.id, kind: 'custom', title: g.name, subtitle: `Groupe perso · ${g.exerciseIds.length} exercices`, exerciseIds: g.exerciseIds }}
            onDelete={() => confirm(`Supprimer le groupe « ${g.name} » ?`) && deleteGroup(g.id)}
          />
        ))}
      </Section>
      <Section title="Partiels blancs (1h, format des annales)">
        {[...by('mock'), ...by('random-mock')].map((d) => (
          <SeriesCard key={d.id} def={d} />
        ))}
      </Section>
    </div>
  )
}
