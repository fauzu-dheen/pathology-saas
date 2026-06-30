import { useState } from 'react'
import type { FormEvent } from 'react'

type ReportFormProps = {
  isSubmitting: boolean
  error: string | null
  onSubmit: (input: { title: string; description: string | null }) => void
}

export default function ReportForm({ isSubmitting, error, onSubmit }: ReportFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
    })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="clinical-card rounded-xl p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#102a35]">Create report</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a report record for cases and slide work.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="clinical-input mt-2 w-full rounded-md px-3 py-2 text-sm outline-none"
            placeholder="Breast biopsy review"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="clinical-input mt-2 min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none"
            placeholder="Optional clinical notes or case context"
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="clinical-button clinical-primary"
        >
          {isSubmitting ? 'Creating...' : 'Create report'}
        </button>
      </div>
    </form>
  )
}
