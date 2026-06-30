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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <p className="text-sm font-medium text-sky-700">First login</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Set up your organization
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This workspace will isolate your users, reports, and uploaded slides.
          </p>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Organization name</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="Acme Pathology"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Organization slug</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
          className="w-full rounded-md bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          Create organization
        </button>
      </form>
    </div>
  )
}
