import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

type AppShellProps = {
  title: string
  eyebrow?: string
  children: ReactNode
}

const navItems = [
  { label: 'Reports', to: '/reports' },
  { label: 'Users', to: '/users' },
]

export default function AppShell({ title, eyebrow = 'Pathology SaaS', children }: AppShellProps) {
  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    window.location.assign('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Workspace
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-950">{eyebrow}</h1>
          </div>

          <nav className="flex gap-2 px-3 pb-4 lg:block lg:space-y-1 lg:px-3 lg:pb-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'block rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-1 lg:block" />

          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
