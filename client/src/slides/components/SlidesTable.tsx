import { Link } from 'react-router-dom'
import type { Slide } from '../types'

type SlidesTableProps = {
  reportId: string
  slides: Slide[]
  canView: boolean
  canShare: boolean
  canDelete: boolean
  isSharing: boolean
  isDeleting: boolean
  onShare: (id: string) => void
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

export default function SlidesTable({
  reportId,
  slides,
  canView,
  canShare,
  canDelete,
  isSharing,
  isDeleting,
  onShare,
  onDelete,
}: SlidesTableProps) {
  if (slides.length === 0) {
    return (
      <div className="clinical-card rounded-md border-dashed p-8 text-center">
        <h2 className="text-base font-semibold text-[#102a35]">No slides yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload an SVS file to attach it to this report.
        </p>
      </div>
    )
  }

  return (
    <div className="clinical-card overflow-hidden rounded-md">
      <div className="overflow-x-auto">
        <table className="clinical-table min-w-full divide-y divide-[#d8e7eb] text-left text-sm">
          <thead className="text-xs font-semibold uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">File</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Size</th>
              <th className="px-5 py-3">Uploaded</th>
              {(canView || canShare || canDelete) && (
                <th className="px-5 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slides.map((slide) => (
              <tr key={slide.id}>
                <td className="px-5 py-4 font-medium text-[#102a35]">{slide.filename}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[#e4f8ef] px-2 py-1 text-xs font-semibold text-[#0f766e]">
                    {slide.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {formatFileSize(slide.file_size_bytes)}
                </td>
                <td className="px-5 py-4 text-slate-600">{formatDate(slide.created_at)}</td>
                {(canView || canShare || canDelete) && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canView && (
                        <Link
                          to={`/reports/${reportId}/slides/${slide.id}/viewer`}
                          className="clinical-secondary rounded-md px-3 py-2 text-xs font-semibold"
                        >
                          View
                        </Link>
                      )}
                      {canShare && (
                        <button
                          type="button"
                          onClick={() => onShare(slide.id)}
                          disabled={isSharing}
                          className="clinical-secondary rounded-md px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Share
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(slide.id)}
                          disabled={isDeleting}
                          className="clinical-danger rounded-md px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
