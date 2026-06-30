import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks'
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
  const canCreate = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:create')
  const canEdit = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:edit')
  const canDelete = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'reports:delete')

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this report?')
    if (confirmed) deleteReport.mutate(id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-sky-700">Pathology SaaS</p>
            <h1 className="text-xl font-semibold text-slate-950">Reports</h1>
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
            Pathology reports
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Create and manage report records. Slide upload and viewing will attach to these reports.
          </p>
        </section>

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
            canEdit={canEdit === true}
            canDelete={canDelete === true}
            isUpdating={updateReport.isPending}
            isDeleting={deleteReport.isPending}
            onUpdate={(input) => updateReport.mutate(input)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
