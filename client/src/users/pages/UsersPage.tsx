import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks'
import UserForm from '../components/UserForm'
import UsersTable from '../components/UsersTable'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../hooks'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

export default function UsersPage() {
  const currentUserQuery = useCurrentUser()
  const usersQuery = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const canManageUsers = currentUserQuery.data?.is_admin === true

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this user from the organization?')
    if (confirmed) deleteUser.mutate(id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-sky-700">Pathology SaaS</p>
            <h1 className="text-xl font-semibold text-slate-950">Users</h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Organization users
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {canManageUsers
              ? 'Admins can pre-create users by email. When those users sign in with Google, their account links to this organization automatically.'
              : 'View organization users and their current access. Admin privileges are required to make changes.'}
          </p>
        </section>

        {canManageUsers && (
          <UserForm
            isSubmitting={createUser.isPending}
            error={createUser.error ? getErrorMessage(createUser.error) : null}
            onSubmit={(input) => createUser.mutate(input)}
          />
        )}

        {updateUser.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(updateUser.error)}
          </p>
        )}
        {deleteUser.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(deleteUser.error)}
          </p>
        )}
        {usersQuery.isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Loading users...
          </div>
        )}

        {usersQuery.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {getErrorMessage(usersQuery.error)}
          </div>
        )}

        {usersQuery.data && (
          <UsersTable
            users={usersQuery.data}
            canManageUsers={canManageUsers}
            isUpdating={updateUser.isPending}
            isDeleting={deleteUser.isPending}
            onUpdate={(input) => updateUser.mutate(input)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
