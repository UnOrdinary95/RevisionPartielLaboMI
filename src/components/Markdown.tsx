import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import { CodeEditor } from './CodeEditor'
import { cn } from '@/lib/utils'

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
        {children}
      </ReactMarkdown>
    </div>
  )
}
