import { useState } from 'react'
import type { FormEvent } from 'react'
import type { UploadProgress } from '../types'

const MAX_SVS_FILE_SIZE_BYTES = 50 * 1024 * 1024

type SlideUploadFormProps = {
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  onSubmit: (files: File[]) => void
}

export default function SlideUploadForm({
  isUploading,
  progress,
  error,
  onSubmit,
}: SlideUploadFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const hasOversizedFiles = files.some((file) => file.size > MAX_SVS_FILE_SIZE_BYTES)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (files.length === 0) return
    if (hasOversizedFiles) {
      setValidationError('Only SVS files below 50 MB are allowed.')
      return
    }
    onSubmit(files)
    setFiles([])
    setValidationError(null)
  }

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setValidationError(
      selectedFiles.some((file) => file.size > MAX_SVS_FILE_SIZE_BYTES)
        ? 'Only SVS files below 50 MB are allowed.'
        : null,
    )
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
          onChange={(event) => handleFilesChange(Array.from(event.target.files ?? []))}
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
        />
        <span className="mt-2 block text-xs text-slate-500">Maximum file size: 50 MB.</span>
      </label>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}`}
              className={file.size > MAX_SVS_FILE_SIZE_BYTES ? 'text-red-600' : undefined}
            >
              {file.name}
              {file.size > MAX_SVS_FILE_SIZE_BYTES ? ' - over 50 MB' : ''}
            </li>
          ))}
        </ul>
      )}

      {progress && (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Upload progress</span>
            <span className="font-semibold text-slate-950">{progress.percent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-700 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="mt-4 space-y-3">
            {progress.files.map((file) => (
              <div key={file.name}>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="max-w-[75%] truncate">{file.name}</span>
                  <span>
                    {file.status === 'complete' ? 'Complete' : `${file.percent}%`}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${file.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(validationError || error) && (
        <p className="mt-4 text-sm text-red-600">{validationError ?? error}</p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isUploading || files.length === 0 || hasOversizedFiles}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Upload slides'}
        </button>
      </div>
    </form>
  )
}
