import { CircleCheck, CircleDashed, CircleHelp, CircleX, CircleAlert } from 'lucide-react'
import type { ItemStatus } from '@/store/progress'
import { cn } from '@/lib/utils'

export const STATUS_LABEL: Record<ItemStatus, string> = {
  todo: 'À faire',
  pending: 'À auto-évaluer',
  success: 'Réussi',
  partial: 'Partiellement réussi',
  fail: 'Échoué',
}

export function StatusIcon({ status, className }: { status: ItemStatus; className?: string }) {
  const c = cn('size-4 shrink-0', className)
  switch (status) {
    case 'success':
      return <CircleCheck className={cn(c, 'text-emerald-500')} />
    case 'partial':
      return <CircleAlert className={cn(c, 'text-amber-500')} />
    case 'fail':
      return <CircleX className={cn(c, 'text-red-500')} />
    case 'pending':
      return <CircleHelp className={cn(c, 'text-sky-400')} />
    default:
      return <CircleDashed className={cn(c, 'text-muted-foreground')} />
  }
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="font-mono text-xs tracking-tight text-amber-400" title={`Probabilité ${n}/3`}>
      {'★'.repeat(n)}
      <span className="text-muted-foreground/40">{'★'.repeat(3 - n)}</span>
    </span>
  )
}
