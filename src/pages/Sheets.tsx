import { NavLink, useParams } from 'react-router'
import { FileText } from 'lucide-react'
import { Markdown } from '@/components/Markdown'
import { cn } from '@/lib/utils'

const sheetFiles = import.meta.glob('../../cheatsheets/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const analyse = import.meta.glob('../../ANALYSE.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const SHEETS = [
  ...Object.entries(analyse).map(([, src]) => ({ slug: 'analyse', title: 'Analyse du partiel', src })),
  ...Object.entries(sheetFiles)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => {
      const name = path.split('/').pop()!.replace(/\.md$/, '')
      return { slug: name, title: name.replace(/-/g, ' '), src }
    }),
]

/** Obsidian → markdown standard : callouts « > [!tip] Titre » rendus comme citations titrées */
function obsidianToMd(src: string) {
  return src
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^> \[!(\w+)\][+-]? ?(.*)$/gm, (_m, kind: string, title: string) => `> **${title || kind.toUpperCase()}**`)
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_m, a: string, b: string) => b || a)
}

export default function Sheets() {
  const { sheet } = useParams()
  const cur = SHEETS.find((s) => s.slug === sheet) ?? SHEETS[0]
  if (!cur)
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Aucune fiche trouvée : les fichiers <code>cheatsheets/*.md</code> et <code>ANALYSE.md</code> n’existent pas encore.
      </div>
    )
  return (
    <div className="mx-auto flex max-w-6xl gap-6 p-6">
      <nav className="sticky top-6 hidden h-fit w-56 shrink-0 space-y-0.5 md:block">
        {SHEETS.map((s) => (
          <NavLink
            key={s.slug}
            to={`/fiches/${s.slug}`}
            className={cn(
              'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
              s.slug === cur.slug && 'bg-muted text-foreground',
            )}
          >
            <FileText className="size-3.5 shrink-0" /> <span className="truncate">{s.title}</span>
          </NavLink>
        ))}
      </nav>
      <article className="min-w-0 flex-1 rounded-xl border border-border bg-card px-8 py-6">
        <Markdown breaks>{obsidianToMd(cur.src)}</Markdown>
      </article>
    </div>
  )
}
