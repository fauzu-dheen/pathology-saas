import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

type AppShellProps = {
  title: string
  eyebrow?: string
  maxWidth?: 'standard' | 'wide'
  children: ReactNode
}

const navItems = [
  { label: 'Reports', to: '/reports', icon: 'reports' },
  { label: 'Users', to: '/users', icon: 'users' },
]

function NavIcon({ name }: { name: string }) {
  if (name === 'users') {
    return (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19c.6-3 2.3-4.5 4.5-4.5s3.9 1.5 4.5 4.5M13.5 18.5c.4-2 1.6-3.2 3.3-3.2 1.8 0 3.1 1.2 3.7 3.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 4.75h7.5L18 8.25v11H7v-15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 4.75v3.5H18M9.5 12h6M9.5 15h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AppShell({
  title,
  eyebrow = 'Pathology SaaS',
  maxWidth = 'standard',
  children,
}: AppShellProps) {
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
              <div className="grid size-10 place-items-center rounded-md border border-cyan-200/25 bg-cyan-100/10">
                <div className="size-5 rounded-sm border-2 border-cyan-100/80 bg-teal-200/20" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100/70">
                  Clinical Workspace
                </p>
                <h1 className="mt-0.5 text-lg font-semibold text-white">{eyebrow}</h1>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 px-3 pb-4 lg:block lg:space-y-1 lg:px-3 lg:pb-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-cyan-50 text-[#082f3a] shadow-sm'
                      : 'text-cyan-50/80 hover:bg-[#123f4a] hover:text-white',
                  ].join(' ')
                }
              >
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-1 lg:block" />

          <div className="border-t border-cyan-100/10 p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-md border border-cyan-100/20 px-3 py-2 text-left text-sm font-medium text-cyan-50/80 hover:bg-[#123f4a] hover:text-white"
            >
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
            <p className="text-sm font-semibold text-[#0f766e]">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#102a35]">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
