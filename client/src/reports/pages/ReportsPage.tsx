import { useCurrentUser } from '../../auth/hooks'
import AppShell from '../../components/AppShell'
import ReportForm from '../components/ReportForm'
import ReportsTable from '../components/ReportsTable'
import { useCreateReport, useDeleteReport, useReports, useUpdateReport } from '../hooks'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

function hasPermission(permissions: string[] | undefined, permission: string) {
  return permissions?.includes(permission) ?? false
}

export default function ReportsPage() {
  const currentUserQuery = useCurrentUser()
  const reportsQuery = useReports()
  const createReport = useCreateReport()
  const updateReport = useUpdateReport()
  const deleteReport = useDeleteReport()

  const currentUser = currentUserQuery.data
  const canCreate =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:create')
  const canEdit = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:edit')
  const canDelete =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:delete')
  const canViewSlides =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:view')

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this report?')
    if (confirmed) deleteReport.mutate(id)
  }

  return (
    <AppShell title="Reports">
      <div className="space-y-5">
        <p className="max-w-2xl text-sm text-slate-600">
          Create and manage pathology reports for the organization.
        </p>

        {canCreate && (
          <ReportForm
            isSubmitting={createReport.isPending}
            error={createReport.error ? getErrorMessage(createReport.error) : null}
            onSubmit={(input) => createReport.mutate(input)}
          />
        )}

        {updateReport.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(updateReport.error)}
          </p>
        )}
        {deleteReport.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(deleteReport.error)}
          </p>
        )}

        {reportsQuery.isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Loading reports...
          </div>
        )}

        {reportsQuery.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {getErrorMessage(reportsQuery.error)}
          </div>
        )}

        {reportsQuery.data && (
          <ReportsTable
            reports={reportsQuery.data}
            canViewSlides={canViewSlides === true}
            canEdit={canEdit === true}
            canDelete={canDelete === true}
            isUpdating={updateReport.isPending}
            isDeleting={deleteReport.isPending}
            onUpdate={(input) => updateReport.mutate(input)}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppShell>
  )
}
