import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ALL_EXERCISES, EXERCISES_BY_ID } from '@/content'
import { randomMockIds, STATIC_SERIES, type SeriesDef } from '@/content/series'

export type SelfEval = 'yes' | 'partial' | 'no'
export const SELF_EVAL_SCORE: Record<SelfEval, number> = { yes: 100, partial: 50, no: 0 }

export type Attempt = {
  at: number
  answer: string
  /** note /100 ; null tant qu'une question de maths n'est pas auto-évaluée */
  score: number | null
  passed?: number
  total?: number
  forbidden?: string[]
  phase?: string
}

export type ItemState = {
  draft: string
  attempts: Attempt[]
  timeMs: number
  solutionViewed: boolean
}

export type Session = {
  id: string
  seriesId: string
  title: string
  exerciseIds: string[]
  createdAt: number
  updatedAt: number
  finishedAt?: number
  status: 'active' | 'finished' | 'abandoned'
  currentIndex: number
  timeLimit?: number
  items: Record<string, ItemState>
}

export type Group = { id: string; name: string; exerciseIds: string[]; createdAt: number }

type State = {
  sessions: Record<string, Session>
  activeBySeries: Record<string, string>
  groups: Group[]
  // actions
  launch: (seriesId: string) => string
  restart: (seriesId: string) => string
  setIndex: (sid: string, i: number) => void
  setDraft: (sid: string, exId: string, draft: string) => void
  addTime: (sid: string, exId: string, ms: number) => void
  recordAttempt: (sid: string, exId: string, a: Attempt) => void
  setSelfEval: (sid: string, exId: string, ev: SelfEval) => void
  viewSolution: (sid: string, exId: string) => void
  finish: (sid: string) => void
  deleteSession: (sid: string) => void
  createGroup: (name: string, ids: string[]) => string
  deleteGroup: (id: string) => void
  importData: (data: Pick<State, 'sessions' | 'activeBySeries' | 'groups'>) => void
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function lastScore(item: ItemState | undefined): number | null {
  if (!item) return null
  for (let i = item.attempts.length - 1; i >= 0; i--) {
    const s = item.attempts[i].score
    if (s !== null) return s
  }
  return null
}

export type ItemStatus = 'todo' | 'pending' | 'success' | 'partial' | 'fail'

export function itemStatus(item: ItemState | undefined): ItemStatus {
  if (!item || item.attempts.length === 0) return 'todo'
  const s = lastScore(item)
  if (s === null) return 'pending'
  if (s >= 100) return 'success'
  if (s > 0) return 'partial'
  return 'fail'
}

/** Historique global par exercice, toutes sessions confondues */
export type ExerciseStats = {
  id: string
  attempts: number
  sessions: number
  timeMs: number
  lastScore: number | null
  lastAt: number | null
  everSucceeded: boolean
  mastered: boolean
  solutionViewedBeforeSuccess: boolean
}

export function computeStats(sessions: Record<string, Session>): Record<string, ExerciseStats> {
  const stats: Record<string, ExerciseStats> = {}
  for (const ex of ALL_EXERCISES) {
    stats[ex.id] = {
      id: ex.id,
      attempts: 0,
      sessions: 0,
      timeMs: 0,
      lastScore: null,
      lastAt: null,
      everSucceeded: false,
      mastered: false,
      solutionViewedBeforeSuccess: false,
    }
  }
  const all = Object.values(sessions).sort((a, b) => a.createdAt - b.createdAt)
  for (const s of all) {
    for (const [exId, item] of Object.entries(s.items)) {
      const st = stats[exId]
      if (!st) continue
      if (item.attempts.length) st.sessions++
      st.attempts += item.attempts.length
      st.timeMs += item.timeMs
      for (const a of item.attempts) {
        if (a.score === null) continue
        if (st.lastAt === null || a.at >= st.lastAt) {
          st.lastAt = a.at
          st.lastScore = a.score
        }
        if (a.score >= 100) st.everSucceeded = true
      }
    }
  }
  for (const st of Object.values(stats)) st.mastered = st.lastScore !== null && st.lastScore >= 80
  return stats
}

export function isWeak(st: ExerciseStats) {
  return st.attempts > 0 && !st.mastered
}

export function seriesDef(seriesId: string, groups: Group[]): SeriesDef | undefined {
  const s = STATIC_SERIES.find((x) => x.id === seriesId)
  if (s) return s
  if (seriesId.startsWith('custom:')) {
    const g = groups.find((x) => 'custom:' + x.id === seriesId)
    if (g) return { id: seriesId, kind: 'custom', title: g.name, subtitle: `${g.exerciseIds.length} exercices`, exerciseIds: g.exerciseIds }
  }
  return undefined
}

function resolveIds(def: SeriesDef, sessions: Record<string, Session>): string[] {
  if (def.kind === 'weak') {
    const stats = computeStats(sessions)
    return ALL_EXERCISES.filter((e) => isWeak(stats[e.id])).map((e) => e.id)
  }
  if (def.kind === 'random-mock') return randomMockIds()
  return (def.exerciseIds ?? []).filter((id) => EXERCISES_BY_ID[id])
}

function emptyItem(exId: string): ItemState {
  return { draft: EXERCISES_BY_ID[exId]?.starter ?? '', attempts: [], timeMs: 0, solutionViewed: false }
}

export const useProgress = create<State>()(
  persist(
    (set, get) => {
      const patchItem = (sid: string, exId: string, f: (it: ItemState) => ItemState) =>
        set((st) => {
          const s = st.sessions[sid]
          if (!s) return st
          const item = s.items[exId] ?? emptyItem(exId)
          return {
            sessions: {
              ...st.sessions,
              [sid]: { ...s, updatedAt: Date.now(), items: { ...s.items, [exId]: f(item) } },
            },
          }
        })

      const create = (seriesId: string): string => {
        const def = seriesDef(seriesId, get().groups)
        if (!def) throw new Error('Série inconnue : ' + seriesId)
        const ids = resolveIds(def, get().sessions)
        const id = uid()
        const now = Date.now()
        const session: Session = {
          id,
          seriesId,
          title: def.title,
          exerciseIds: ids,
          createdAt: now,
          updatedAt: now,
          status: 'active',
          currentIndex: 0,
          timeLimit: def.timeLimit,
          items: Object.fromEntries(ids.map((x) => [x, emptyItem(x)])),
        }
        set((st) => ({
          sessions: { ...st.sessions, [id]: session },
          activeBySeries: { ...st.activeBySeries, [seriesId]: id },
        }))
        return id
      }

      return {
        sessions: {},
        activeBySeries: {},
        groups: [],

        launch: (seriesId) => {
          const cur = get().activeBySeries[seriesId]
          if (cur && get().sessions[cur]) return cur
          return create(seriesId)
        },

        restart: (seriesId) => {
          const cur = get().activeBySeries[seriesId]
          if (cur && get().sessions[cur]?.status === 'active') {
            const s = get().sessions[cur]
            const touched = Object.values(s.items).some((i) => i.attempts.length || i.timeMs > 0)
            set((st) => {
              const sessions = { ...st.sessions }
              if (touched) sessions[cur] = { ...s, status: 'abandoned', finishedAt: Date.now() }
              else delete sessions[cur]
              return { sessions }
            })
          }
          return create(seriesId)
        },

        setIndex: (sid, i) =>
          set((st) => (st.sessions[sid] ? { sessions: { ...st.sessions, [sid]: { ...st.sessions[sid], currentIndex: i } } } : st)),

        setDraft: (sid, exId, draft) => patchItem(sid, exId, (it) => ({ ...it, draft })),

        addTime: (sid, exId, ms) => patchItem(sid, exId, (it) => ({ ...it, timeMs: it.timeMs + ms })),

        recordAttempt: (sid, exId, a) => patchItem(sid, exId, (it) => ({ ...it, attempts: [...it.attempts, a] })),

        setSelfEval: (sid, exId, ev) =>
          patchItem(sid, exId, (it) => {
            if (!it.attempts.length) return it
            const attempts = [...it.attempts]
            attempts[attempts.length - 1] = { ...attempts[attempts.length - 1], score: SELF_EVAL_SCORE[ev] }
            return { ...it, attempts, solutionViewed: true }
          }),

        viewSolution: (sid, exId) => patchItem(sid, exId, (it) => ({ ...it, solutionViewed: true })),

        finish: (sid) =>
          set((st) =>
            st.sessions[sid]
              ? { sessions: { ...st.sessions, [sid]: { ...st.sessions[sid], status: 'finished', finishedAt: Date.now() } } }
              : st,
          ),

        deleteSession: (sid) =>
          set((st) => {
            const sessions = { ...st.sessions }
            delete sessions[sid]
            const activeBySeries = Object.fromEntries(Object.entries(st.activeBySeries).filter(([, v]) => v !== sid))
            return { sessions, activeBySeries }
          }),

        createGroup: (name, ids) => {
          const id = uid()
          set((st) => ({ groups: [...st.groups, { id, name, exerciseIds: ids, createdAt: Date.now() }] }))
          return id
        },

        deleteGroup: (id) =>
          set((st) => ({
            groups: st.groups.filter((g) => g.id !== id),
          })),

        importData: (data) => set({ sessions: data.sessions ?? {}, activeBySeries: data.activeBySeries ?? {}, groups: data.groups ?? [] }),
      }
    },
    { name: 'labomi-progress', version: 1 },
  ),
)

export function sessionProgress(s: Session) {
  const done = s.exerciseIds.filter((id) => {
    const st = itemStatus(s.items[id])
    return st !== 'todo' && st !== 'pending'
  }).length
  return { done, total: s.exerciseIds.length }
}

export function sessionScore(s: Session) {
  if (!s.exerciseIds.length) return 0
  const sum = s.exerciseIds.reduce((acc, id) => acc + (lastScore(s.items[id]) ?? 0), 0)
  return Math.round(sum / s.exerciseIds.length)
}

export function sessionTime(s: Session) {
  return Object.values(s.items).reduce((a, i) => a + i.timeMs, 0)
}

export function formatDuration(ms: number) {
  const t = Math.round(ms / 1000)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  if (h) return `${h} h ${m.toString().padStart(2, '0')} min`
  if (m) return `${m} min ${s.toString().padStart(2, '0')} s`
  return `${s} s`
}
