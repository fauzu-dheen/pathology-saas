import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Report } from '../types'

type ReportsTableProps = {
  reports: Report[]
  canViewSlides: boolean
  canEdit: boolean
  canDelete: boolean
  isUpdating: boolean
  isDeleting: boolean
  onUpdate: (input: { id: string; title: string; description: string | null }) => void
  onDelete: (id: string) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function ReportsTable({
  reports,
  canViewSlides,
  canEdit,
  canDelete,
  isUpdating,
  isDeleting,
  onUpdate,
  onDelete,
}: ReportsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const showActions = canViewSlides || canEdit || canDelete

  const startEdit = (report: Report) => {
    setEditingId(report.id)
    setDraftTitle(report.title)
    setDraftDescription(report.description ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftTitle('')
    setDraftDescription('')
  }

  const saveEdit = (id: string) => {
    onUpdate({
      id,
      title: draftTitle.trim(),
      description: draftDescription.trim() || null,
    })
    cancelEdit()
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-slate-950">No reports yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create the first report to start attaching whole slide images.
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
              <th className="px-5 py-3">Report</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Updated</th>
              {showActions && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => {
              const isEditing = editingId === report.id

              return (
                <tr key={report.id} className="align-top">
                  <td className="px-5 py-4">
                    {isEditing && canEdit ? (
                      <div className="grid min-w-80 gap-3">
                        <input
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                        <textarea
                          value={draftDescription}
                          onChange={(event) => setDraftDescription(event.target.value)}
                          className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-950">{report.title}</p>
                        <p className="mt-1 max-w-xl text-slate-600">
                          {report.description || 'No description'}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(report.created_at)}</td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(report.updated_at)}</td>
                  {showActions && (
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(report.id)}
                            disabled={isUpdating}
                            className="rounded-md bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => startEdit(report)}
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                          )}
                          {canViewSlides && (
                            <Link
                              to={`/reports/${report.id}/slides`}
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Slides
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(report.id)}
                              disabled={isDeleting}
                              className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
