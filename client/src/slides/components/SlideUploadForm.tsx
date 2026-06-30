import { useState } from 'react'
import type { FormEvent } from 'react'

type SlideUploadFormProps = {
  isUploading: boolean
  error: string | null
  onSubmit: (files: File[]) => void
}

export default function SlideUploadForm({ isUploading, error, onSubmit }: SlideUploadFormProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (files.length === 0) return
    onSubmit(files)
    setFiles([])
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">Upload SVS files</h2>
        <p className="mt-1 text-sm text-slate-600">
          Attach one or more whole slide images to this report.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">SVS files</span>
        <input
          type="file"
          accept=".svs"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isUploading || files.length === 0}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Upload slides'}
        </button>
      </div>
    </form>
  )
}
