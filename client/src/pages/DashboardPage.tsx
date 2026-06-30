import { Link } from 'react-router-dom'

const dashboardItems = [
  { label: 'Users', value: '0', description: 'Organization members' },
  { label: 'Reports', value: '0', description: 'Pathology reports' },
  { label: 'SVS files', value: '0', description: 'Uploaded slides' },
  { label: 'Shares', value: '0', description: 'Active slide links' },
]

export default function DashboardPage() {
  const handleSignOut = () => {
    localStorage.removeItem('access_token')
    window.location.assign('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-sky-700">Pathology SaaS</p>
            <h1 className="text-xl font-semibold text-slate-950">Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Workspace overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            This is the first protected application screen. We will build user management, reports,
            uploads, slide viewing, and sharing into this shell.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardItems.map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Organization roster</h2>
              <p className="mt-1 text-sm text-slate-600">
                View organization members and their current access.
              </p>
            </div>
            <Link
              to="/users"
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              View users
            </Link>
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Reports</h2>
              <p className="mt-1 text-sm text-slate-600">
                View and manage pathology reports for this organization.
              </p>
            </div>
            <Link
              to="/reports"
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              View reports
            </Link>
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">SVS uploads</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open a report to upload and manage its whole slide images.
              </p>
            </div>
            <Link
              to="/reports"
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Choose report
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
