import { Check, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { ALL_PERMISSIONS } from '../types'
import type { Permission, User } from '../types'

type UsersTableProps = {
  users: User[]
  canManageUsers: boolean
  currentUserId: string | null
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
  canManageUsers,
  currentUserId,
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
      <div className="clinical-card rounded-md border-dashed p-8 text-center">
        <h2 className="text-base font-semibold text-[#102a35]">No users yet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create the first non-admin user to start building the organization roster.
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
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Google linked</th>
              <th className="px-5 py-3">Access</th>
              <th className="px-5 py-3">Permissions</th>
              {canManageUsers && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isEditing = editingId === user.id
              const isCurrentUser = currentUserId === user.id

              return (
                <tr key={user.id} className="align-top">
                  <td className="px-5 py-4">
                    {isEditing && canManageUsers ? (
                      <div className="space-y-2">
                        <input
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          className="clinical-input w-full rounded-md px-3 py-2 text-sm outline-none"
                          placeholder="Name"
                        />
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-[#102a35]">{user.name || 'Unnamed user'}</p>
                        <p className="mt-1 text-slate-600">{user.email}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        user.google_sub
                          ? 'inline-flex rounded-full bg-[#e4f8ef] px-2 py-1 text-xs font-medium text-[#0f766e]'
                          : 'inline-flex rounded-full bg-[#fff7d6] px-2 py-1 text-xs font-medium text-[#8a5a00]'
                      }
                    >
                      {user.google_sub ? 'Linked' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {isEditing && canManageUsers ? (
                      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftIsAdmin}
                          onChange={(event) => setDraftIsAdmin(event.target.checked)}
                          className="size-4 rounded border-slate-300 text-[#0f766e] focus:ring-[#bdecea]"
                        />
                        Admin
                      </label>
                    ) : (
                      <span className="text-slate-700">{user.is_admin ? 'Admin' : 'Member'}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isEditing && canManageUsers ? (
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
                              className="size-4 rounded border-slate-300 text-[#0f766e] focus:ring-[#bdecea]"
                            />
                            {permission}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex max-w-80 flex-wrap gap-1.5">
                        {user.is_admin ? (
                          <span className="rounded-full bg-[#0f766e] px-2 py-1 text-xs font-medium text-white">
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
                  {canManageUsers && (
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(user.id)}
                            disabled={isUpdating}
                            className="clinical-icon-button clinical-primary"
                            aria-label="Save user"
                            title="Save"
                          >
                            <Check className="size-4" strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="clinical-icon-button clinical-secondary"
                            aria-label="Cancel edit"
                            title="Cancel"
                          >
                            <X className="size-4" strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            className="clinical-icon-button clinical-secondary"
                            aria-label={`Edit ${user.name || user.email}`}
                            title="Edit"
                          >
                            <Pencil className="size-4" strokeWidth={2} />
                          </button>
                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => onDelete(user.id)}
                              disabled={isDeleting}
                              className="clinical-icon-button clinical-danger"
                              aria-label={`Delete ${user.name || user.email}`}
                              title="Delete"
                            >
                              <Trash2 className="size-4" strokeWidth={2} />
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
