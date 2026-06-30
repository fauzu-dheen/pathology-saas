import { Link, useParams } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks'
import { useReports } from '../../reports/hooks'
import { getSlideDziUrl, getSlideTileUrl } from '../api'
import OpenSeadragonViewer from '../components/OpenSeadragonViewer'
import { useSlides } from '../hooks'

function hasPermission(permissions: string[] | undefined, permission: string) {
  return permissions?.includes(permission) ?? false
}

export default function SlideViewerPage() {
  const { reportId, slideId } = useParams()
  const currentUserQuery = useCurrentUser()
  const reportsQuery = useReports()
  const slidesQuery = useSlides(reportId)

  const currentUser = currentUserQuery.data
  const report = reportsQuery.data?.find((item) => item.id === reportId)
  const slide = slidesQuery.data?.find((item) => item.id === slideId)
  const canView = currentUser?.is_admin || hasPermission(currentUser?.permissions, 'slides:view')

  if (!reportId || !slideId) {
    return <div className="p-8 text-sm text-red-700">Missing slide route parameters.</div>
  }

  if (currentUserQuery.isLoading || reportsQuery.isLoading || slidesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">Loading viewer...</div>
    )
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-sm text-red-700">
        You do not have permission to view slides.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-sky-700">{report?.title ?? 'Report'}</p>
            <h1 className="text-xl font-semibold text-slate-950">
              {slide?.filename ?? 'Slide viewer'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/reports/${reportId}/slides`}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Slides
            </Link>
            <Link
              to="/reports"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Reports
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <OpenSeadragonViewer
          dziUrl={getSlideDziUrl(reportId, slideId)}
          getTileUrl={(level, col, row) => getSlideTileUrl(reportId, slideId, level, col, row)}
        />
      </main>
    </div>
  )
}
