import type { Slide } from '../types'

type SlidesTableProps = {
  slides: Slide[]
  canDelete: boolean
  isDeleting: boolean
  onDelete: (id: string) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatFileSize(value: number | null) {
  if (value === null) return 'Unknown'
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export default function SlidesTable({ slides, canDelete, isDeleting, onDelete }: SlidesTableProps) {
  if (slides.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-slate-950">No slides yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload an SVS file to attach it to this report.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">File</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Size</th>
              <th className="px-5 py-3">Uploaded</th>
              {canDelete && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slides.map((slide) => (
              <tr key={slide.id}>
                <td className="px-5 py-4 font-medium text-slate-950">{slide.filename}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {slide.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {formatFileSize(slide.file_size_bytes)}
                </td>
                <td className="px-5 py-4 text-slate-600">{formatDate(slide.created_at)}</td>
                {canDelete && (
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(slide.id)}
                      disabled={isDeleting}
                      className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
