import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { FileText, Microscope, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import type { AuthResponse } from './types'

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) return

    setError(null)

    try {
      const data = await apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ id_token: cred.credential }),
      })

      if (data.needs_onboarding && data.pending_token) {
        navigate('/onboard', { state: { pendingToken: data.pending_token } })
      } else if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        navigate('/dashboard')
      } else {
        setError('Login response was missing a session token.')
      }
    } catch {
      setError('Google sign-in succeeded, but the application login failed.')
    }
  }

  return (
    <div className="clinical-page-bg flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <main className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#cfe0e5] bg-white shadow-2xl shadow-[#102a35]/10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="clinical-auth-visual hidden min-h-[560px] flex-col justify-between p-10 text-white lg:flex">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl border border-cyan-100/20 bg-[#123f4a]">
              <Microscope className="size-6" strokeWidth={1.8} />
            </div>
            <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-cyan-50/75">
              Digital Pathology
            </p>
            <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-tight">
              Secure slide review for modern clinical labs.
            </h1>
          </div>

          <div className="grid gap-3 text-sm text-cyan-50/85">
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-100/10 bg-[#123f4a] p-3">
              <ShieldCheck className="size-5 text-cyan-100" strokeWidth={1.8} />
              Tenant-isolated access and permissions
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-100/10 bg-[#123f4a] p-3">
              <FileText className="size-5 text-cyan-100" strokeWidth={1.8} />
              Reports and whole slide workflows
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-100/10 bg-[#123f4a] p-3">
              <Users className="size-5 text-cyan-100" strokeWidth={1.8} />
              Simple team management
            </div>
          </div>
        </section>

        <section className="flex min-h-[560px] items-center p-6 sm:p-10">
          <div className="w-full">
            <div className="mb-8">
              <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#082f3a] text-white lg:hidden">
                <Microscope className="size-6" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold text-[#0f766e]">Pathology SaaS</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#102a35]">
                Sign in to your workspace
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                Use your Google account to access users, reports, and whole slide images.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d8e7eb] bg-[#f7fbfc] p-4">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google login failed. Please try again.')}
              />
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </section>
      </main>
    </div>
  )
}
