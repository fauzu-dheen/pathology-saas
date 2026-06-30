import { Building2, ClipboardList, Microscope, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { AuthResponse } from './types'

export default function OnboardPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [error, setError] = useState<string | null>(null)

  const pendingToken = state?.pendingToken

  if (!pendingToken) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const data = await apiFetch<AuthResponse>('/auth/onboard', {
        method: 'POST',
        body: JSON.stringify({ pending_token: pendingToken, org_name: orgName, org_slug: orgSlug }),
      })
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        navigate('/dashboard')
      } else {
        setError('Onboarding response was missing a session token.')
      }
    } catch {
      setError('Could not create organization — slug may already be taken.')
    }
  }

  return (
    <div className="clinical-page-bg flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <main className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#cfe0e5] bg-white shadow-2xl shadow-[#102a35]/10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="clinical-auth-visual hidden min-h-[600px] flex-col justify-between p-10 text-white lg:flex">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl border border-cyan-100/20 bg-[#123f4a]">
              <Building2 className="size-6" strokeWidth={1.8} />
            </div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-cyan-50/75">
              New Organization
            </p>
            <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-tight">
              Create a private workspace for your lab.
            </h1>
          </div>

          <div className="grid gap-3 text-sm text-cyan-50/85">
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-100/10 bg-[#123f4a] p-3">
              <ShieldCheck className="size-5 text-cyan-100" strokeWidth={1.8} />
              Admin access is granted automatically
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-100/10 bg-[#123f4a] p-3">
              <ClipboardList className="size-5 text-cyan-100" strokeWidth={1.8} />
              Reports and slides stay scoped to this organization
            </div>
          </div>
        </section>

        <section className="flex min-h-[600px] items-center p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#082f3a] text-white lg:hidden">
                <Microscope className="size-6" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold text-[#0f766e]">First login</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102a35]">
                Set up your organization
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                This creates your isolated clinical workspace for users, reports, and uploaded
                slides.
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Organization name</span>
              <input
                className="clinical-input mt-2 w-full rounded-xl px-3 py-3 outline-none"
                placeholder="Acme Pathology"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Organization slug</span>
              <input
                className="clinical-input mt-2 w-full rounded-xl px-3 py-3 outline-none"
                placeholder="acme-pathology"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
                pattern="[a-z0-9-]+"
                required
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="clinical-button clinical-primary w-full">
              Create organization
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
