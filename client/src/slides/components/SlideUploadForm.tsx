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
    <form onSubmit={handleSubmit} className="clinical-card rounded-xl p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#102a35]">Upload SVS files</h2>
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
          className="clinical-input mt-2 block w-full rounded-md px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#dff7f6] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#0f766e] hover:file:bg-[#c9eeec]"
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
        <div className="clinical-muted-panel mt-5 rounded-md p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Upload progress</span>
            <span className="font-semibold text-[#102a35]">{progress.percent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#0f766e] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
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
          className="clinical-button clinical-primary"
        >
          {isUploading ? 'Uploading...' : 'Upload slides'}
        </button>
      </div>
    </form>
  )
}
