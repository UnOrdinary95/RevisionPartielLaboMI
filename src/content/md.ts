/**
 * Tag de template pour écrire du markdown sans échapper le LaTeX.
 * - ''' est remplacé par ``` (blocs de code)
 * - § est remplacé par ` (code en ligne)
 */
export const md = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw(s, ...v)
    .replaceAll("'''", '```')
    .replaceAll('§', '`')
    .replace(/^\n/, '')

/** Code Python brut (pas d'échappement) */
export const py = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw(s, ...v).replace(/^\n/, '')
