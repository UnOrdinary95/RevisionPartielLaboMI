import { createHashRouter, NavLink, Outlet, RouterProvider } from 'react-router'
import { BarChart3, BookOpen, History, House, Sigma } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { onPyStatus, warmup, type PyStatus } from '@/runner/python'
import { cn } from '@/lib/utils'
import Home from '@/pages/Home'
import ExercisePage from '@/pages/Exercise'
import Recap from '@/pages/Recap'
import Dashboard from '@/pages/Dashboard'
import HistoryPage from '@/pages/History'
import Sheets from '@/pages/Sheets'

const NAV = [
  { to: '/', label: 'Accueil', icon: House, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/historique', label: 'Historique', icon: History },
  { to: '/fiches', label: 'Fiches', icon: BookOpen },
]

function PyBadge() {
  const [s, setS] = useState<PyStatus>('idle')
  useEffect(() => onPyStatus(setS), [])
  const map: Record<PyStatus, [string, string]> = {
    idle: ['bg-zinc-500', 'Python : en attente'],
    loading: ['bg-amber-500 animate-pulse', 'Python : chargement…'],
    ready: ['bg-emerald-500', 'Python prêt'],
    error: ['bg-red-500', 'Python : erreur de chargement (connexion ?)'],
  }
  const [color, label] = map[s]
  return (
    <div className="flex items-center gap-2 px-3 text-[11px] text-muted-foreground" title={label}>
      <span className={cn('size-1.5 rounded-full', color)} />
      <span className="hidden lg:inline">{label}</span>
    </div>
  )
}

function Layout() {
  useEffect(() => {
    warmup()
  }, [])
  return (
    <div className="flex h-full">
      <aside className="flex w-14 shrink-0 flex-col border-r border-border bg-sidebar lg:w-52">
        <div className="flex h-14 items-center gap-2 px-4">
          <Sigma className="size-5 text-amber-500" />
          <span className="hidden text-sm font-semibold tracking-tight lg:inline">Labo MI · Partiel</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-muted text-foreground',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="py-3">
          <PyBadge />
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/s/:sid/recap', element: <Recap /> },
      { path: '/s/:sid/:index', element: <ExercisePage /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/historique', element: <HistoryPage /> },
      { path: '/fiches', element: <Sheets /> },
      { path: '/fiches/:sheet', element: <Sheets /> },
    ],
  },
])

export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}
