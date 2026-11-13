import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { FileText, FolderPlus, KeyRound, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AnswersDialog, SolutionDialog } from '@/components/ExerciseDialogs'
import { Stars, STATUS_LABEL, StatusIcon } from '@/components/StatusIcon'
import { EXERCISES_BY_ID } from '@/content'
import { formatDuration, itemStatus, lastScore, sessionScore, sessionTime, useProgress } from '@/store/progress'

export default function Recap() {
  const { sid = '' } = useParams()
  const nav = useNavigate()
  const session = useProgress((s) => s.sessions[sid])
  const { restart, createGroup, finish } = useProgress()
  const [answers, setAnswers] = useState<string | null>(null)
  const [solution, setSolution] = useState<string | null>(null)
  if (!session) return <Navigate to="/" replace />

  const failed = session.exerciseIds.filter((id) => (lastScore(session.items[id]) ?? 0) < 80)

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Accueil</Link>
          <h1 className="mt-1 text-xl font-semibold">Récapitulatif · {session.title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(session.createdAt).toLocaleString('fr-FR')} · {formatDuration(sessionTime(session))}
            {session.timeLimit ? ` (limite ${session.timeLimit} min)` : ''} · note moyenne{' '}
            <span className="font-medium text-foreground">{sessionScore(session)}/100</span>
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {session.status === 'active' && (
            <>
              <Button size="sm" variant="outline" onClick={() => nav(`/s/${sid}/${session.currentIndex}`)}>Reprendre</Button>
              <Button size="sm" variant="outline" onClick={() => finish(sid)}>Marquer terminé</Button>
            </>
          )}
          {failed.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const name = prompt('Nom du groupe ?', `À revoir · ${session.title}`)
                if (!name) return
                createGroup(name, failed)
                toast.success(`Groupe « ${name} » créé (${failed.length} exercices)`)
              }}
            >
              <FolderPlus className="size-3.5" /> Grouper les {failed.length} non réussis
            </Button>
          )}
          <Button size="sm" onClick={() => { const id = restart(session.seriesId); nav(`/s/${id}/0`) }}>
            <RotateCcw className="size-3.5" /> Relancer la série
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table className="[&_td]:px-1.5 [&_th]:px-1.5 sm:[&_td]:px-2 sm:[&_th]:px-2">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="hidden w-10 sm:table-cell">#</TableHead>
              <TableHead>Exercice</TableHead>
              <TableHead className="hidden text-center sm:table-cell">Réponses</TableHead>
              <TableHead className="text-center">Durée</TableHead>
              <TableHead className="text-center">État</TableHead>
              <TableHead className="text-center">Note</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {session.exerciseIds.map((id, i) => {
              const ex = EXERCISES_BY_ID[id]
              const item = session.items[id]
              const st = itemStatus(item)
              const sc = lastScore(item)
              return (
                <TableRow key={id}>
                  <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">{i + 1}</TableCell>
                  <TableCell>
                    <button className="text-left hover:underline" onClick={() => nav(`/s/${sid}/${i}`)}>
                      <div className="font-medium whitespace-normal">{ex.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">{ex.kind === 'code' ? 'Code' : 'Maths'}</Badge>
                        P{ex.problem} <Stars n={ex.stars} />
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="hidden text-center tabular-nums sm:table-cell">{item?.attempts.length ?? 0}</TableCell>
                  <TableCell className="text-center tabular-nums">{formatDuration(item?.timeMs ?? 0)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center" title={STATUS_LABEL[st]}>
                      <StatusIcon status={st} className="size-5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium tabular-nums">{sc ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button size="xs" className="bg-indigo-600 text-white hover:bg-indigo-500" title="Mes réponses" aria-label="Mes réponses" onClick={() => setAnswers(id)}><FileText className="sm:hidden" /><span className="hidden sm:inline">Mes réponses</span></Button>
                      <Button size="xs" variant="outline" title="Correction" aria-label="Correction" onClick={() => setSolution(id)}><KeyRound className="sm:hidden" /><span className="hidden sm:inline">Correction</span></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {answers && (
        <AnswersDialog ex={EXERCISES_BY_ID[answers]} item={session.items[answers]} open onOpenChange={(o) => !o && setAnswers(null)} />
      )}
      {solution && <SolutionDialog ex={EXERCISES_BY_ID[solution]} open onOpenChange={(o) => !o && setSolution(null)} />}
    </div>
  )
}
