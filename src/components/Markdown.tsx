import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import { CodeEditor } from './CodeEditor'
import { cn } from '@/lib/utils'

/**
 * Un bloc $$…$$ doit être entouré de lignes vides pour être rendu en mode « display » :
 * sinon remark-math le colle au paragraphe voisin comme une formule en ligne.
 * On ajoute ces lignes vides (hors blocs de code).
 */
function isolateDisplayMath(src: string) {
  const lines = src.split('\n')
  const out: string[] = []
  let inCode = false
  let inMath = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    if (t.startsWith('```')) inCode = !inCode
    if (inCode) {
      out.push(line)
      continue
    }
    if (!inMath && t.startsWith('$$')) {
      if (out.length && out[out.length - 1].trim() !== '') out.push('')
      const indent = line.slice(0, line.length - line.trimStart().length)
      const oneLine = t.length > 4 && t.endsWith('$$')
      if (oneLine) {
        // « $$ x $$ » sur une ligne = formule EN LIGNE pour remark-math 6 : on l'étale sur 3 lignes
        out.push(indent + '$$', indent + t.slice(2, -2).trim(), indent + '$$')
        if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('')
      } else {
        out.push(line)
        inMath = true
      }
      continue
    }
    out.push(line)
    if (inMath && t.endsWith('$$')) {
      inMath = false
      if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('')
    }
  }
  return out.join('\n')
}

export function Markdown({ children, className, breaks }: { children: string; className?: string; breaks?: boolean }) {
  return (
    <div className={cn('prose-md', className)}>
      <ReactMarkdown
        remarkPlugins={breaks ? [remarkGfm, remarkMath, remarkBreaks] : [remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const text = String(children ?? '')
            const isBlock = /language-/.test(className ?? '') || text.includes('\n')
            if (!isBlock) return <code>{children}</code>
            const lang = (className ?? '').replace('language-', '')
            if (lang === 'python' || lang === 'py')
              return <CodeEditor value={text.replace(/\n$/, '')} readOnly minHeight="0" />
            return (
              <pre className="overflow-x-auto rounded-lg border border-border bg-[#1e1e1e] p-3 font-mono text-[13px] leading-relaxed text-zinc-300">
                {text.replace(/\n$/, '')}
              </pre>
            )
          },
        }}
      >
        {isolateDisplayMath(children)}
      </ReactMarkdown>
    </div>
  )
}
