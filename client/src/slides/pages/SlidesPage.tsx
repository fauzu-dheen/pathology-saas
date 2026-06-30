import { Link, useParams } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks'
import { useReports } from '../../reports/hooks'
import SlideUploadForm from '../components/SlideUploadForm'
import SlidesTable from '../components/SlidesTable'
import { useDeleteSlide, useSlides, useUploadSlides } from '../hooks'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

function hasPermission(permissions: string[] | undefined, permission: string) {
  return permissions?.includes(permission) ?? false
}

export default function SlidesPage() {
  const { reportId } = useParams()
  const currentUserQuery = useCurrentUser()
  const reportsQuery = useReports()
  const slidesQuery = useSlides(reportId)
  const uploadSlides = useUploadSlides(reportId)
  const deleteSlide = useDeleteSlide(reportId)

  const currentUser = currentUserQuery.data
  const report = reportsQuery.data?.find((item) => item.id === reportId)
  const canUpload =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:upload')
  const canView = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:view')
  const canDelete =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:delete')

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this slide?')
    if (confirmed) deleteSlide.mutate(id)
  }

  if (!reportId) {
    return <div className="p-8 text-sm text-red-700">Missing report id.</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-sky-700">Pathology SaaS</p>
            <h1 className="text-xl font-semibold text-slate-950">Slides</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/reports"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Reports
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {report?.title ?? 'Report slides'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Upload and manage SVS files attached to this report.
          </p>
        </section>

        {canUpload && (
          <SlideUploadForm
            isUploading={uploadSlides.isPending}
            error={uploadSlides.error ? getErrorMessage(uploadSlides.error) : null}
            onSubmit={(files) => uploadSlides.mutate({ reportId, files })}
          />
        )}

        {deleteSlide.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(deleteSlide.error)}
          </p>
        )}

        {slidesQuery.isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Loading slides...
          </div>
        )}

        {slidesQuery.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {getErrorMessage(slidesQuery.error)}
          </div>
        )}

        {slidesQuery.data && (
          <SlidesTable
            reportId={reportId}
            slides={slidesQuery.data}
            canView={canView === true}
            canDelete={canDelete === true}
            isDeleting={deleteSlide.isPending}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
