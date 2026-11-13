export type Problem = 1 | 2 | 3

export type TestSpec =
  | {
      label?: string
      expr: string
      /** source Python de la valeur attendue (mode eq/approx) ou chaîne brute (mode repr/str) */
      expected: string
      mode?: 'eq' | 'approx' | 'repr' | 'str'
      tol?: number
    }
  | {
      label: string
      /** script qui doit définir `ok` (et éventuellement `got`, `expected`) */
      script: string
    }

export type Exercise = {
  id: string
  problem: Problem
  kind: 'code' | 'math'
  title: string
  /** probabilité estimée de tomber au partiel */
  stars: 1 | 2 | 3
  statement: string
  reminder?: string
  starter?: string
  setup?: string
  tests?: TestSpec[]
  forbid?: string[]
  /** correction (markdown) */
  solution: string
  /** pour les questions de maths : réponse attendue courte affichée en premier */
  answer?: string
  tags: string[]
  source?: string
}

export const PROBLEMS: Record<Problem, { title: string; short: string }> = {
  1: { title: 'Ensemble de Mandelbrot', short: 'Complexes' },
  2: { title: 'Polynômes', short: 'Polynômes' },
  3: { title: 'Calcul de e, de π et des racines carrées', short: 'Floats, Rat, e' },
}
