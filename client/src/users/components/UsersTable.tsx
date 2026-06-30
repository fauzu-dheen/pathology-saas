import { useState } from 'react'
import { ALL_PERMISSIONS } from '../types'
import type { Permission, User } from '../types'

type UsersTableProps = {
  users: User[]
  isUpdating: boolean
  isDeleting: boolean
  onUpdate: (input: {
    id: string
    name: string | null
    is_admin: boolean
    permissions: Permission[]
  }) => void
  onDelete: (id: string) => void
}

export default function UsersTable({
  users,
  isUpdating,
  isDeleting,
  onUpdate,
  onDelete,
}: UsersTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftIsAdmin, setDraftIsAdmin] = useState(false)
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>([])

  const startEdit = (user: User) => {
    setEditingId(user.id)
    setDraftName(user.name ?? '')
    setDraftIsAdmin(user.is_admin)
    setDraftPermissions(user.permissions)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftName('')
    setDraftIsAdmin(false)
    setDraftPermissions([])
  }

  const togglePermission = (permission: Permission) => {
    setDraftPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    )
  }

  const saveEdit = (id: string) => {
    onUpdate({
      id,
      name: draftName.trim() || null,
      is_admin: draftIsAdmin,
      permissions: draftPermissions,
    })
    cancelEdit()
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-slate-950">No users yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create the first non-admin user to start building the organization roster.
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
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Google linked</th>
              <th className="px-5 py-3">Access</th>
              <th className="px-5 py-3">Permissions</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isEditing = editingId === user.id

              return (
                <tr key={user.id} className="align-top">
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          placeholder="Name"
                        />
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-950">{user.name || 'Unnamed user'}</p>
                        <p className="mt-1 text-slate-600">{user.email}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        user.google_sub
                          ? 'inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700'
                          : 'inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700'
                      }
                    >
                      {user.google_sub ? 'Linked' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftIsAdmin}
                          onChange={(event) => setDraftIsAdmin(event.target.checked)}
                          className="size-4 rounded border-slate-300 text-sky-700 focus:ring-sky-200"
                        />
                        Admin
                      </label>
                    ) : (
                      <span className="text-slate-700">{user.is_admin ? 'Admin' : 'Member'}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <div className="grid min-w-64 gap-2">
                        {ALL_PERMISSIONS.map((permission) => (
                          <label
                            key={permission}
                            className="inline-flex items-center gap-2 text-sm text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={draftPermissions.includes(permission)}
                              onChange={() => togglePermission(permission)}
                              className="size-4 rounded border-slate-300 text-sky-700 focus:ring-sky-200"
                            />
                            {permission}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex max-w-80 flex-wrap gap-1.5">
                        {user.is_admin ? (
                          <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                            All permissions
                          </span>
                        ) : user.permissions.length > 0 ? (
                          user.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">No explicit permissions</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(user.id)}
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
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(user.id)}
                          disabled={isDeleting}
                          className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
