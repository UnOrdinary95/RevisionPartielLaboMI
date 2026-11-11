import { P1 } from './p1'
import { P2 } from './p2'
import { P3 } from './p3'
import type { Exercise } from './types'

export const ALL_EXERCISES: Exercise[] = [...P1, ...P2, ...P3]
export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(
  ALL_EXERCISES.map((e) => [e.id, e]),
)
