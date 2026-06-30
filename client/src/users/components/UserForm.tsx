import { useState } from 'react'
import type { FormEvent } from 'react'

type UserFormProps = {
  isSubmitting: boolean
  error: string | null
  onSubmit: (input: { email: string; name: string | null }) => void
}

export default function UserForm({ isSubmitting, error, onSubmit }: UserFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      email: email.trim(),
      name: name.trim() || null,
    })
    setEmail('')
    setName('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="clinical-card rounded-md p-5"
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#102a35]">Create user</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a user by email. Their Google account links on first sign-in.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="clinical-input mt-2 w-full rounded-md px-3 py-2 text-sm outline-none"
            placeholder="pathologist@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="clinical-input mt-2 w-full rounded-md px-3 py-2 text-sm outline-none"
            placeholder="Dr. Jane Doe"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="clinical-primary rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create user'}
        </button>
      </div>
    </form>
  )
}
