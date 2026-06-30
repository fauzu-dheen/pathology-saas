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
      <div className="clinical-card rounded-md border-dashed p-8 text-center">
        <h2 className="text-base font-semibold text-[#102a35]">No reports yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create the first report to start attaching whole slide images.
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
                          className="clinical-input w-full rounded-md px-3 py-2 text-sm outline-none"
                        />
                        <textarea
                          value={draftDescription}
                          onChange={(event) => setDraftDescription(event.target.value)}
                          className="clinical-input min-h-20 w-full rounded-md px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-[#102a35]">{report.title}</p>
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
                            className="clinical-primary rounded-md px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="clinical-secondary rounded-md px-3 py-2 text-xs font-semibold"
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
                              className="clinical-secondary rounded-md px-3 py-2 text-xs font-semibold"
                            >
                              Edit
                            </button>
                          )}
                          {canViewSlides && (
                            <Link
                              to={`/reports/${report.id}/slides`}
                              className="clinical-secondary rounded-md px-3 py-2 text-xs font-semibold"
                            >
                              Slides
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(report.id)}
                              disabled={isDeleting}
                              className="clinical-danger rounded-md px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
