import { P1 } from './p1'
import { P2 } from './p2'
import { P3 } from './p3'
import type { Exercise } from './types'

/** Banque complète, y compris les ★ (très improbables), toujours vérifiée par `pnpm verify` */
export const BANK: Exercise[] = [...P1, ...P2, ...P3]

/** Exercices proposés sur le site : on masque les ★ (probabilité trop faible) */
export const ALL_EXERCISES: Exercise[] = BANK.filter((e) => e.stars >= 2)

/** Recherche par id sur toute la banque (les anciennes sessions peuvent contenir des ★) */
export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(BANK.map((e) => [e.id, e]))

export const isVisible = (id: string) => (EXERCISES_BY_ID[id]?.stars ?? 0) >= 2
