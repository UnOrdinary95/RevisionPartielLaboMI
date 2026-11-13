import { useNavigate } from 'react-router'
import { Download, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDuration, sessionProgress, sessionScore, sessionTime, useProgress } from '@/store/progress'

const STATUS = { active: ['En cours', 'border-emerald-600/50 text-emerald-400'], finished: ['Terminée', ''], abandoned: ['Archivée', 'text-muted-foreground'] } as const

export default function HistoryPage() {
  const nav = useNavigate()
  const { sessions, deleteSession, importData } = useProgress()
  const list = Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt)

  const exportJson = () => {
    const { sessions, activeBySeries, groups } = useProgress.getState()
    const blob = new Blob([JSON.stringify({ sessions, activeBySeries, groups }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `labomi-progression-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }
  const importJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      try {
        const data = JSON.parse(await f.text())
        if (!confirm('Remplacer toute la progression actuelle par ce fichier ?')) return
        importData(data)
        toast.success('Progression importée')
      } catch {
        toast.error('Fichier invalide')
      }
    }
    input.click()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-xl font-semibold">Historique des sessions</h1>
          <p className="text-sm text-muted-foreground">{list.length} session(s). La progression est stockée dans ce navigateur.</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportJson}><Download className="size-3.5" /> Exporter</Button>
          <Button size="sm" variant="outline" onClick={importJson}><Upload className="size-3.5" /> Importer</Button>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucune session pour l’instant.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table className="[&_td]:px-1.5 [&_th]:px-1.5 sm:[&_td]:px-2 sm:[&_th]:px-2">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Série</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden text-center sm:table-cell">Statut</TableHead>
                <TableHead className="text-center">Progression</TableHead>
                <TableHead className="hidden text-center sm:table-cell">Durée</TableHead>
                <TableHead className="text-center">Note</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((s) => {
                const p = sessionProgress(s)
                const [label, cls] = STATUS[s.status]
                return (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => nav(`/s/${s.id}/recap`)}>
                    <TableCell className="font-medium whitespace-normal">{s.title}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{new Date(s.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                    <TableCell className="hidden text-center sm:table-cell"><Badge variant="outline" className={cls}>{label}</Badge></TableCell>
                    <TableCell className="text-center tabular-nums">{p.done}/{p.total}</TableCell>
                    <TableCell className="hidden text-center tabular-nums sm:table-cell">{formatDuration(sessionTime(s))}</TableCell>
                    <TableCell className="text-center font-medium tabular-nums">{sessionScore(s)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Supprimer définitivement cette session ?')) deleteSession(s.id)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
