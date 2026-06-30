import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import type { AuthResponse } from './types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) return;

    setError(null);

    try {
      const data = await apiFetch<AuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ id_token: cred.credential }),
      });

      if (data.needs_onboarding && data.pending_token) {
        navigate('/onboard', { state: { pendingToken: data.pending_token } });
      } else if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        navigate('/dashboard');
      } else {
        setError('Login response was missing a session token.');
      }
    } catch {
      setError('Google sign-in succeeded, but the application login failed.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <main className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-sky-700">Pathology SaaS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
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
  );
}
