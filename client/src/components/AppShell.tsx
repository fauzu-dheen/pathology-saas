import { ClipboardList, LogOut, Microscope, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useCurrentUser } from '../auth/hooks'

type AppShellProps = {
  title: string
  eyebrow?: string
  maxWidth?: 'standard' | 'wide'
  children: ReactNode
}

const navItems = [
  { label: 'Reports', to: '/reports', icon: ClipboardList },
  { label: 'Users', to: '/users', icon: Users },
]

export default function AppShell({
  title,
  eyebrow = 'Pathology SaaS',
  maxWidth = 'standard',
  children,
}: AppShellProps) {
  const currentUserQuery = useCurrentUser()
  const organizationName = currentUserQuery.data?.org_name ?? eyebrow
  const organizationSlug = currentUserQuery.data?.org_slug

  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    window.location.assign('/login')
  }

  return (
    <div className="clinical-page-bg min-h-screen text-[#102a35] lg:flex">
      <aside className="border-b border-[#174a56] bg-[#082f3a] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl border border-cyan-200/25 bg-cyan-100/10">
                <Microscope className="size-5 text-cyan-50" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100/70">
                  Pathology SaaS
                </p>
                <h1 className="mt-0.5 text-lg font-semibold text-white">{organizationName}</h1>
                {organizationSlug && (
                  <p className="mt-0.5 max-w-36 truncate text-xs text-cyan-50/60">
                    /{organizationSlug}
                  </p>
                )}
              </div>
            </div>
          </div>

          <nav className="flex gap-2 px-3 pb-4 lg:block lg:space-y-1 lg:px-3 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-cyan-50 text-[#082f3a] shadow-sm'
                        : 'text-cyan-50/80 hover:bg-[#123f4a] hover:text-white',
                    ].join(' ')
                  }
                >
                  <Icon className="size-4" strokeWidth={1.9} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="hidden flex-1 lg:block" />

          <div className="border-t border-cyan-100/10 p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="clinical-button w-full border border-cyan-100/20 px-3 text-left text-cyan-50/80 hover:bg-[#123f4a] hover:text-white"
            >
              <LogOut className="size-4" strokeWidth={1.9} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64">
        <main
          className={[
            'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
            maxWidth === 'wide' ? 'max-w-7xl' : 'max-w-6xl',
          ].join(' ')}
        >
          <div className="mb-6">
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#102a35]">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
