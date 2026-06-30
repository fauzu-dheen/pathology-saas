import { useCurrentUser } from '../../auth/hooks'
import AppShell from '../../components/AppShell'
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
    <AppShell title="Users">
      <div className="space-y-5">
        <p className="max-w-2xl text-sm text-slate-600">
          {canManageUsers
            ? 'Add users by email and manage their access.'
            : 'View organization users and their access.'}
        </p>

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
          <div className="clinical-card rounded-md p-8 text-sm text-slate-600">
            Loading users...
          </div>
        )}

        {usersQuery.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
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
      </div>
    </AppShell>
  )
}
