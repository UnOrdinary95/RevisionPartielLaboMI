import { ALL_EXERCISES, EXERCISES_BY_ID } from './index'
import type { Exercise, Problem } from './types'

export type SeriesKind = 'problem' | 'essentials' | 'weak' | 'mock' | 'random-mock' | 'custom'

export type SeriesDef = {
  id: string
  kind: SeriesKind
  title: string
  subtitle: string
  /** liste fixe d'exercices (sinon calculée au lancement) */
  exerciseIds?: string[]
  /** durée limite en minutes (partiels blancs) */
  timeLimit?: number
  problem?: Problem
}

const byStars = (a: Exercise, b: Exercise) => b.stars - a.stars

export const problemIds = (p: Problem) =>
  ALL_EXERCISES.filter((e) => e.problem === p)
    .sort((a, b) => byStars(a, b) || (a.kind === b.kind ? 0 : a.kind === 'code' ? -1 : 1))
    .map((e) => e.id)

/** Partiels blancs rédigés au format des annales : 1 classe + 1 exercice par problème */
export const MOCKS: SeriesDef[] = [
  {
    id: 'mock-a',
    kind: 'mock',
    title: 'Partiel blanc A',
    subtitle: 'Classe Poly · Mandelbrot · e',
    timeLimit: 60,
    exerciseIds: ['p2-poly-classe', 'p1-m-ops', 'p1-rang-echap', 'p3-m-irreductible', 'p3-approx-e-float'],
  },
  {
    id: 'mock-b',
    kind: 'mock',
    title: 'Partiel blanc B',
    subtitle: 'Classe Rat · suite · Horner',
    timeLimit: 60,
    exerciseIds: ['p3-rat-classe', 'p3-m-operations', 'p1-m-termes-i', 'p1-suite', 'p2-m-cout-fast-horner', 'p2-horner'],
  },
  {
    id: 'mock-c',
    kind: 'mock',
    title: 'Partiel blanc C',
    subtitle: 'Classe Complexe · dérivée · Newton',
    timeLimit: 60,
    exerciseIds: ['p1-complexe-classe', 'p2-m-calculs2', 'p2-derive', 'p3-m-newton-sqrt', 'p3-mysqrt'],
  },
]

export const STATIC_SERIES: SeriesDef[] = [
  { id: 'p1', kind: 'problem', problem: 1, title: 'Problème 1 · Mandelbrot', subtitle: 'Complexes, suites, récurrences', exerciseIds: problemIds(1) },
  { id: 'p2', kind: 'problem', problem: 2, title: 'Problème 2 · Polynômes', subtitle: 'Classe Poly, Horner, degrés', exerciseIds: problemIds(2) },
  { id: 'p3', kind: 'problem', problem: 3, title: 'Problème 3 · e, π, √', subtitle: 'Floats, Rat, séries, Newton', exerciseIds: problemIds(3) },
  {
    id: 'essentials',
    kind: 'essentials',
    title: 'Les essentiels ★★★',
    subtitle: 'Uniquement le très probable',
    exerciseIds: ALL_EXERCISES.filter((e) => e.stars === 3).map((e) => e.id),
  },
  { id: 'weak', kind: 'weak', title: 'Non maîtrisés', subtitle: 'Exercices ratés ou jamais réussis' },
  ...MOCKS,
  { id: 'random-mock', kind: 'random-mock', title: 'Partiel blanc aléatoire', subtitle: '1 classe + 1 exercice par problème', timeLimit: 60 },
]

const CLASS_IDS = ['p1-complexe-classe', 'p2-poly-classe', 'p3-rat-classe']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Génère un partiel blanc aléatoire au gabarit des annales */
export function randomMockIds(): string[] {
  const cls = pick(CLASS_IDS)
  const clsProblem = EXERCISES_BY_ID[cls].problem
  const ids = [cls]
  const others = ([1, 2, 3] as Problem[]).filter((p) => p !== clsProblem)
  others.forEach((p, i) => {
    const pool = ALL_EXERCISES.filter((e) => e.problem === p && e.stars >= 2 && !CLASS_IDS.includes(e.id))
    ids.push(pick(pool.filter((e) => e.kind === 'code')).id)
    if (i === 1) ids.push(pick(pool.filter((e) => e.kind === 'math')).id)
  })
  // une question de maths liée à la classe
  const clsMath = ALL_EXERCISES.filter((e) => e.problem === clsProblem && e.kind === 'math' && e.stars === 3)
  if (clsMath.length) ids.splice(1, 0, pick(clsMath).id)
  return ids
}
