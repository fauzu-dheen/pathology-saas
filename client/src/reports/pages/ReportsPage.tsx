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
  const currentUser = currentUserQuery.data
  const canViewReports =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:view')
  const reportsQuery = useReports(canViewReports === true)
  const createReport = useCreateReport()
  const updateReport = useUpdateReport()
  const deleteReport = useDeleteReport()

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

        {canViewReports && canCreate && (
          <ReportForm
            isSubmitting={createReport.isPending}
            error={createReport.error ? getErrorMessage(createReport.error) : null}
            onSubmit={(input) => createReport.mutate(input)}
          />
        )}

        {currentUserQuery.isLoading && (
          <div className="clinical-card rounded-md p-8 text-sm text-slate-600">
            Checking report access...
          </div>
        )}

        {currentUser && !canViewReports && (
          <div className="clinical-card rounded-md p-8">
            <h2 className="text-base font-semibold text-[#102a35]">Reports access required</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              You do not have permission to view reports. Ask an organization admin to grant
              reports:view access.
            </p>
          </div>
        )}

        {canViewReports && updateReport.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(updateReport.error)}
          </p>
        )}
        {canViewReports && deleteReport.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(deleteReport.error)}
          </p>
        )}

        {canViewReports && reportsQuery.isLoading && (
          <div className="clinical-card rounded-md p-8 text-sm text-slate-600">
            Loading reports...
          </div>
        )}

        {canViewReports && reportsQuery.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {getErrorMessage(reportsQuery.error)}
          </div>
        )}

        {canViewReports && reportsQuery.data && (
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
