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
    <div className="clinical-page-bg flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="clinical-card w-full max-w-md space-y-5 rounded-md p-8"
      >
        <div>
          <div className="mb-5 grid size-11 place-items-center rounded-md bg-[#082f3a]">
            <div className="size-5 rounded-sm border-2 border-cyan-100 bg-teal-200/20" />
          </div>
          <p className="text-sm font-semibold text-[#0f766e]">First login</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#102a35]">
            Set up your organization
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This workspace will isolate your users, reports, and uploaded slides.
          </p>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Organization name</span>
          <input
            className="clinical-input mt-2 w-full rounded-md px-3 py-2 outline-none"
            placeholder="Acme Pathology"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Organization slug</span>
          <input
            className="clinical-input mt-2 w-full rounded-md px-3 py-2 outline-none"
            placeholder="acme-pathology"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
            pattern="[a-z0-9-]+"
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="clinical-primary w-full rounded-md px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#bdecea]"
        >
          Create organization
        </button>
      </form>
    </div>
  )
}
