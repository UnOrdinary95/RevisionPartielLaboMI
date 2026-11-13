import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Flag,
  KeyRound,
  Lightbulb,
  ListTree,
  Loader2,
  Play,
  RotateCcw,
  Timer,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CodeEditor } from '@/components/CodeEditor'
import { Markdown } from '@/components/Markdown'
import { TestReport } from '@/components/TestReport'
import { Stars, STATUS_LABEL, StatusIcon } from '@/components/StatusIcon'
import { EXERCISES_BY_ID } from '@/content'
import { PROBLEMS } from '@/content/types'
import { runCode, runTests, type RunResult, type TestReport as Report } from '@/runner/python'
import {
  formatDuration,
  itemStatus,
  lastScore,
  sessionProgress,
  sessionTime,
  useProgress,
  type SelfEval,
  type Session,
} from '@/store/progress'
import { cn } from '@/lib/utils'

function NavTimeline({ session, index }: { session: Session; index: number }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <ListTree className="size-3.5" /> Navigation
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[70vh] w-96 overflow-y-auto p-2">
        <ol className="relative">
          {session.exerciseIds.map((id, i) => {
            const ex = EXERCISES_BY_ID[id]
            const st = itemStatus(session.items[id])
            return (
              <li key={id} className="relative">
                {i < session.exerciseIds.length - 1 && <span className="absolute top-7 left-[17px] h-[calc(100%-16px)] w-px bg-border" />}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    nav(`/s/${session.id}/${i}`)
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted',
                    i === index && 'bg-muted ring-1 ring-amber-500/40',
                  )}
                >
                  <span className="mt-0.5 rounded-full bg-popover p-0.5">
                    <StatusIcon status={st} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">
                      <span className="text-muted-foreground tabular-nums">{i + 1}. </span>
                      {ex?.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {STATUS_LABEL[st]}
                      {lastScore(session.items[id]) !== null && ` · ${lastScore(session.items[id])}/100`}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </PopoverContent>
    </Popover>
  )
}

function SelfEvalBox({ value, onChoose, disabled }: { value: number | null; onChoose: (e: SelfEval) => void; disabled?: boolean }) {
  const opts: [SelfEval, string, string, number][] = [
    ['yes', 'Oui', 'border-emerald-600/50 hover:bg-emerald-500/10', 100],
    ['partial', 'En partie', 'border-amber-600/50 hover:bg-amber-500/10', 50],
    ['no', 'Non', 'border-red-600/50 hover:bg-red-500/10', 0],
  ]
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-600/40 bg-sky-500/5 px-4 py-3">
      <span className="text-sm font-medium">As-tu trouvé ça ?</span>
      <div className="flex gap-2">
        {opts.map(([k, label, cls, score]) => (
          <Button
            key={k}
            size="sm"
            variant="outline"
            disabled={disabled}
            className={cn(cls, value === score && 'ring-2 ring-offset-0 ring-foreground/30 bg-muted')}
            onClick={() => onChoose(k)}
          >
            {label}
          </Button>
        ))}
      </div>
      {value !== null && <span className="text-xs text-muted-foreground">Auto-évaluation enregistrée : {value}/100</span>}
    </div>
  )
}

export default function ExercisePage() {
  const { sid = '', index: idxStr = '0' } = useParams()
  const index = Number(idxStr)
  const nav = useNavigate()
  const session = useProgress((s) => s.sessions[sid])
  const { setDraft, addTime, recordAttempt, setSelfEval, viewSolution, resetItem, setIndex, finish } = useProgress()

  const exId = session?.exerciseIds[index]
  const ex = exId ? EXERCISES_BY_ID[exId] : undefined
  const item = exId ? session?.items[exId] : undefined
  const readOnly = session?.status !== 'active'

  const [running, setRunning] = useState<'run' | 'test' | null>(null)
  const [runOut, setRunOut] = useState<RunResult | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [showReminder, setShowReminder] = useState(!session?.timeLimit)
  const [preview, setPreview] = useState(false)

  // reset de l'état local quand on change d'exercice
  useEffect(() => {
    setRunOut(null)
    setReport(null)
    setShowSolution(false)
    setPreview(false)
    setShowReminder(!session?.timeLimit)
    if (session && session.currentIndex !== index) setIndex(sid, index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, index])

  // chronomètre (temps actif), arrêté dès que l'exercice est réussi à 100 %
  const solved = lastScore(item) === 100
  useEffect(() => {
    if (!exId || readOnly || solved) return
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') addTime(sid, exId, 1000)
    }, 1000)
    return () => window.clearInterval(t)
  }, [sid, exId, readOnly, solved, addTime])

  const goto = useCallback(
    (i: number) => {
      if (!session) return
      if (i >= 0 && i < session.exerciseIds.length) nav(`/s/${sid}/${i}`)
    },
    [nav, sid, session],
  )

  const onRun = async () => {
    if (!ex || !item) return
    setRunning('run')
    setRunOut(await runCode(item.draft, ex.setup))
    setRunning(null)
  }

  const onReset = () => {
    if (!ex || readOnly) return
    if (!confirm('Recharger l’exercice ? Ton code, tes réponses envoyées et le chrono de cet exercice seront remis à zéro.')) return
    resetItem(sid, ex.id)
    setRunOut(null)
    setReport(null)
    setShowSolution(false)
    setPreview(false)
    toast('Exercice remis à zéro')
  }

  const onValidate = async () => {
    if (!ex || !item || readOnly) return
    if (ex.kind === 'math') {
      if (!item.draft.trim() && !confirm('Ta réponse est vide. Valider quand même ?')) return
      recordAttempt(sid, ex.id, { at: Date.now(), answer: item.draft, score: null })
      return
    }
    setRunning('test')
    const r = await runTests(item.draft, ex.tests ?? [], ex.forbid, ex.setup)
    setRunning(null)
    setReport(r)
    recordAttempt(sid, ex.id, {
      at: Date.now(),
      answer: item.draft,
      score: r.phase === 'ok' ? r.score : 0,
      passed: r.tests.filter((t) => t.ok).length,
      total: r.tests.length || ex.tests?.length,
      forbidden: r.forbidden,
      phase: r.phase,
    })
    if (r.phase === 'ok' && r.score === 100) toast.success('Tous les tests passent !')
  }

  // raccourcis : Alt+← / Alt+→, Ctrl+Entrée (exécuter), Ctrl+Maj+Entrée (valider)
  const handlers = useRef({ onRun, onValidate, goto, index })
  handlers.current = { onRun, onValidate, goto, index }
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const H = handlers.current
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        H.goto(H.index - 1)
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault()
        H.goto(H.index + 1)
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) H.onValidate()
        else H.onRun()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (!session) return <Navigate to="/" replace />
  if (!ex || !item) return <Navigate to={`/s/${sid}/recap`} replace />

  const attempts = item.attempts
  const last = attempts[attempts.length - 1]
  const score = lastScore(item)
  const validated = attempts.length > 0
  const prog = sessionProgress(session)
  const total = session.exerciseIds.length
  const elapsed = sessionTime(session)
  const remaining = session.timeLimit ? session.timeLimit * 60000 - elapsed : null
  const allDone = prog.done === total

  const onFinish = () => {
    if (!allDone && !confirm(`${total - prog.done} exercice(s) non terminé(s), qui compteront 0. Terminer la série ?`)) return
    finish(sid)
    nav(`/s/${sid}/recap`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-3 sm:p-6">
      {/* barre du haut */}
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {session.title}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {remaining !== null ? (
            <Badge variant="outline" className={cn('gap-1 tabular-nums', remaining < 0 ? 'border-red-600 text-red-400' : remaining < 600000 ? 'border-amber-600 text-amber-400' : '')}>
              <Timer className="size-3" />
              {remaining < 0 ? `Temps écoulé (+${formatDuration(-remaining)})` : `Reste ${formatDuration(remaining)}`}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 tabular-nums">
              <Clock className="size-3" /> {formatDuration(item.timeMs)}
            </Badge>
          )}
          <Badge className="bg-indigo-600 text-white tabular-nums">
            {index + 1} / {total}
          </Badge>
          <NavTimeline session={session} index={index} />
        </div>
      </div>

      {/* carte exercice */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-muted/30 px-3 py-3 sm:px-5">
          <StatusIcon status={itemStatus(item)} className="size-5" />
          <h1 className="font-medium">{ex.title}</h1>
          <Stars n={ex.stars} />
          <div className="ml-auto flex items-center gap-1.5">
            <Badge variant="outline">{ex.kind === 'code' ? 'Code' : 'Maths'}</Badge>
            <Badge variant="secondary" title={PROBLEMS[ex.problem].title}>
              P{ex.problem}
            </Badge>
          </div>
        </div>

        <div className="space-y-4 p-3 sm:p-5">
          <Markdown>{ex.statement}</Markdown>
          {ex.source && <p className="text-xs text-muted-foreground">Source : {ex.source}</p>}

          {ex.reminder && (
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5">
              <button
                type="button"
                onClick={() => setShowReminder((s) => !s)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-indigo-300"
              >
                <Lightbulb className="size-4" /> Rappel / prérequis
                <ChevronDown className={cn('ml-auto size-4 transition-transform', !showReminder && '-rotate-90')} />
              </button>
              {showReminder && (
                <div className="border-t border-indigo-500/20 px-4 py-1">
                  <Markdown>{ex.reminder}</Markdown>
                </div>
              )}
            </div>
          )}

          {validated && score !== null && (
            <div className="rounded-lg border border-sky-600/40 bg-sky-500/10 px-4 py-2.5 text-sm">
              Note actuelle : <span className="font-semibold tabular-nums">{score} / 100</span>
              <span className="text-muted-foreground"> · {attempts.length} réponse(s) envoyée(s)</span>
            </div>
          )}

          {/* rapport de tests (code) */}
          {ex.kind === 'code' && report && <TestReport report={report} />}
          {ex.kind === 'code' && !report && last && last.total !== undefined && (
            <div className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground">
              Dernière validation : {last.passed}/{last.total} tests
              {last.forbidden?.length ? ` · interdit utilisé : ${last.forbidden.join(', ')}` : ''}
              {last.phase && last.phase !== 'ok' ? ` · ${last.phase}` : ''}
            </div>
          )}

          {/* zone de réponse */}
          {ex.kind === 'code' ? (
            <div className="space-y-2">
              <CodeEditor value={item.draft} onChange={(v) => setDraft(sid, ex.id, v)} readOnly={readOnly} />
              {runOut && (
                <div className="rounded-lg border border-border bg-black/40 p-3 font-mono text-xs">
                  <div className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">Console</div>
                  {runOut.stdout && <pre className="whitespace-pre-wrap text-zinc-200">{runOut.stdout}</pre>}
                  {runOut.error && <pre className="whitespace-pre-wrap text-red-300">{runOut.error}</pre>}
                  {!runOut.stdout && !runOut.error && <span className="text-muted-foreground">(aucune sortie, ajoute des print pour tester)</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Ta réponse (LaTeX accepté entre $…$)</span>
                <Button size="xs" variant="ghost" className="ml-auto" onClick={() => setPreview((p) => !p)}>
                  <Eye className="size-3" /> {preview ? 'Éditer' : 'Aperçu'}
                </Button>
              </div>
              {preview ? (
                <div className="min-h-40 rounded-lg border border-border p-3">
                  <Markdown>{item.draft || '*Vide*'}</Markdown>
                </div>
              ) : (
                <Textarea
                  value={item.draft}
                  onChange={(e) => setDraft(sid, ex.id, e.target.value)}
                  readOnly={readOnly}
                  placeholder="Écris ta réponse comme sur ta copie…"
                  className="min-h-40 font-mono text-sm"
                />
              )}
            </div>
          )}

          {/* correction maths : révélée après validation */}
          {ex.kind === 'math' && validated && (
            <div className="space-y-3">
              {ex.answer && (
                <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/5 px-4 py-2">
                  <div className="text-xs font-medium text-emerald-400">Réponse attendue</div>
                  <Markdown>{ex.answer}</Markdown>
                </div>
              )}
              <SelfEvalBox
                value={last?.score ?? null}
                disabled={readOnly}
                onChoose={(e) => setSelfEval(sid, ex.id, e)}
              />
            </div>
          )}

          {/* boutons */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!validated}
              title={validated ? '' : 'Disponible après une première validation'}
              onClick={() => {
                setShowSolution((s) => !s)
                viewSolution(sid, ex.id)
              }}
            >
              <KeyRound className="size-3.5" /> {showSolution ? 'Masquer la solution' : 'Solution'}
            </Button>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={onReset} title="Remet le code, les réponses et le chrono à zéro">
                <RotateCcw className="size-3.5" /> Recharger
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              {ex.kind === 'code' && (
                <Button variant="outline" size="sm" onClick={onRun} disabled={!!running} title="Ctrl+Entrée">
                  {running === 'run' ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Exécuter
                </Button>
              )}
              {!readOnly && (
                <Button size="sm" onClick={onValidate} disabled={!!running} className="bg-indigo-600 text-white hover:bg-indigo-500" title="Ctrl+Maj+Entrée">
                  {running === 'test' ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Valider la réponse
                </Button>
              )}
            </div>
          </div>

          {showSolution && validated && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-300">
                <KeyRound className="size-4" /> Correction
              </div>
              <Markdown>{ex.solution}</Markdown>
            </div>
          )}
        </div>
      </div>

      {/* navigation bas */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {prog.done}/{total} terminés · Alt+←/→ pour naviguer
        </span>
        <div className="ml-auto flex items-center gap-2">
          {!readOnly && (index === total - 1 || allDone) && (
            <Button size="sm" variant={allDone ? 'default' : 'outline'} onClick={onFinish}>
              <Flag className="size-3.5" /> Terminer la série
            </Button>
          )}
          {readOnly && (
            <Button size="sm" variant="outline" onClick={() => nav(`/s/${sid}/recap`)}>
              Récapitulatif
            </Button>
          )}
          <Button size="icon" variant="outline" disabled={index === 0} onClick={() => goto(index - 1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <Button size="icon" variant="outline" disabled={index === total - 1} onClick={() => goto(index + 1)}>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
