import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
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
    <div className="clinical-page-bg flex min-h-screen items-center justify-center px-6">
      <main className="clinical-card w-full max-w-md rounded-md p-8">
        <div className="mb-8">
          <div className="mb-5 grid size-11 place-items-center rounded-md bg-[#082f3a]">
            <div className="size-5 rounded-sm border-2 border-cyan-100 bg-teal-200/20" />
          </div>
          <p className="text-sm font-semibold text-[#0f766e]">Pathology SaaS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#102a35]">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your Google account to access reports and whole slide images.
          </p>
        </div>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Google login failed. Please try again.')}
        />
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </main>
    </div>
  )
}
