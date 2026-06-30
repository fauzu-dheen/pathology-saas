import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks'
import AppShell from '../../components/AppShell'
import { useReports } from '../../reports/hooks'
import { useCreateShare } from '../../shares/hooks'
import SlideUploadForm from '../components/SlideUploadForm'
import SlidesTable from '../components/SlidesTable'
import { useDeleteSlide, useSlides, useUploadSlides } from '../hooks'
import type { UploadProgress } from '../types'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

function hasPermission(permissions: string[] | undefined, permission: string) {
  return permissions?.includes(permission) ?? false
}

export default function SlidesPage() {
  const { reportId } = useParams()
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const currentUserQuery = useCurrentUser()
  const reportsQuery = useReports()
  const slidesQuery = useSlides(reportId)
  const uploadSlides = useUploadSlides(reportId)
  const deleteSlide = useDeleteSlide(reportId)
  const createShare = useCreateShare()

  const currentUser = currentUserQuery.data
  const report = reportsQuery.data?.find((item) => item.id === reportId)
  const canUpload =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:upload')
  const canView = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:view')
  const canShare = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:share')
  const canDelete =
    currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:delete')

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('Delete this slide?')
    if (confirmed) deleteSlide.mutate(id)
  }

  const handleUpload = (files: File[]) => {
    if (!reportId) return
    setUploadProgress(null)
    uploadSlides.mutate(
      { reportId, files, onProgress: setUploadProgress },
      {
        onSuccess: () => setUploadProgress(null),
      },
    )
  }

  const handleShare = (slideId: string) => {
    if (!reportId) return
    createShare.mutate(
      { reportId, slideId },
      {
        onSuccess: async (share) => {
          const shareUrl = `${window.location.origin}/shared/${share.token}`
          try {
            await navigator.clipboard?.writeText(shareUrl)
            window.alert(`Share link copied:\n${shareUrl}`)
          } catch {
            window.alert(`Share link:\n${shareUrl}`)
          }
        },
      },
    )
  }

  if (!reportId) {
    return <div className="p-8 text-sm text-red-700">Missing report id.</div>
  }

  return (
    <AppShell title={report?.title ?? 'Report slides'}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-slate-600">
            Upload and manage SVS files attached to this report.
          </p>
          <Link
            to="/reports"
            className="clinical-button clinical-secondary w-fit"
          >
            Back to reports
          </Link>
        </div>

        {canUpload && (
          <SlideUploadForm
            isUploading={uploadSlides.isPending}
            progress={uploadProgress}
            error={uploadSlides.error ? getErrorMessage(uploadSlides.error) : null}
            onSubmit={handleUpload}
          />
        )}

        {deleteSlide.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(deleteSlide.error)}
          </p>
        )}
        {createShare.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(createShare.error)}
          </p>
        )}

        {slidesQuery.isLoading && (
          <div className="clinical-card rounded-md p-8 text-sm text-slate-600">
            Loading slides...
          </div>
        )}

        {slidesQuery.error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {getErrorMessage(slidesQuery.error)}
          </div>
        )}

        {slidesQuery.data && (
          <SlidesTable
            reportId={reportId}
            slides={slidesQuery.data}
            canView={canView === true}
            canShare={canShare === true}
            canDelete={canDelete === true}
            isSharing={createShare.isPending}
            isDeleting={deleteSlide.isPending}
            onShare={handleShare}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppShell>
  )
}
